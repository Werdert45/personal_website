import json
import os

import requests
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .knowledge import (
    SYSTEM_PROMPT,
    block_ip,
    daily_cap_reached,
    is_ip_blocked,
    search_kb_with_category,
)

MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_MODEL = os.environ.get("MINIMAX_MODEL", "abab6.5s-chat")
MINIMAX_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2"

# Shared proxy contract: when set, the Next.js proxy forwards this secret in the
# x-internal-proxy-secret header and puts the real client IP as the leftmost XFF.
# Unset/empty => "not configured" => stay permissive (do not reject, do not trust XFF).
INTERNAL_PROXY_SECRET = os.environ.get("INTERNAL_PROXY_SECRET", "")

# Per-IP rolling-window rate limit (requests per 60s).
CHAT_RATE_PER_MIN = int(os.environ.get("CHAT_RATE_PER_MIN", "10"))

MIN_MESSAGE_LEN = 4
MAX_MESSAGE_LEN = 500

OFF_TOPIC_REPLY = (
    "I can only answer questions about Ian — his work, research, background, "
    "or how to reach him."
)


def _proxy_secret_ok(request) -> bool:
    """True if the request carries a valid internal-proxy secret header.

    Only meaningful when INTERNAL_PROXY_SECRET is configured (non-empty).
    """
    if not INTERNAL_PROXY_SECRET:
        return False
    return request.META.get("HTTP_X_INTERNAL_PROXY_SECRET", "") == INTERNAL_PROXY_SECRET


def _get_ip(request) -> str:
    # Only trust the proxy-forwarded XFF when the trusted proxy authenticated
    # itself with the shared secret. Otherwise XFF is attacker-controlled.
    if _proxy_secret_ok(request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def _call_minimax(context: str, user_message: str) -> str:
    system = f"{SYSTEM_PROMPT}\n\nContext:\n{context}"
    resp = requests.post(
        MINIMAX_URL,
        headers={
            "Authorization": f"Bearer {MINIMAX_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MINIMAX_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_message},
            ],
        },
        timeout=15,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


@csrf_exempt
@require_POST
def chat(request):
    # Proxy-secret gate: if INTERNAL_PROXY_SECRET is configured, the request must
    # carry a matching secret header (i.e. it transited the trusted Next proxy).
    # Unset/empty => not configured => stay permissive.
    if INTERNAL_PROXY_SECRET and not _proxy_secret_ok(request):
        return JsonResponse({"error": "forbidden"}, status=403)

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    message = str(body.get("message", "")).strip()

    # Length gates
    if len(message) < MIN_MESSAGE_LEN:
        return JsonResponse({"error": "message too short"}, status=400)
    message = message[:MAX_MESSAGE_LEN]

    ip = _get_ip(request)

    # Per-IP rate limit (rolling 60s window). Must run BEFORE any FTS/LLM work so
    # 429s cost nothing. Uses Django's cache (LocMemCache by default).
    rl_key = f"chatrl:{ip}"
    cache.add(rl_key, 0, 60)
    try:
        count = cache.incr(rl_key)
    except ValueError:
        # Key expired between add and incr; treat as first request in a new window.
        cache.set(rl_key, 1, 60)
        count = 1
    if count > CHAT_RATE_PER_MIN:
        return JsonResponse({"error": "rate_limited"}, status=429)

    # IP block gate
    if is_ip_blocked(ip):
        return JsonResponse({"reply": OFF_TOPIC_REPLY, "blocked": True})

    # FTS gate — if no relevant chunks exist, skip MiniMax entirely
    chunks_with_cats = search_kb_with_category(message)
    if not chunks_with_cats:
        return JsonResponse({"reply": OFF_TOPIC_REPLY})

    top_category = chunks_with_cats[0][0]
    context = "\n\n".join(c[1] for c in chunks_with_cats)

    if not MINIMAX_API_KEY:
        return JsonResponse(
            {
                "reply": (
                    "The AI assistant is not yet configured on this server. "
                    "Set MINIMAX_API_KEY in the backend environment to enable it."
                ),
                "category": top_category,
            }
        )

    # Global daily cost cap — short-circuit before the paid API call.
    if daily_cap_reached():
        return JsonResponse(
            {
                "reply": (
                    "The assistant is taking a short break for today. "
                    "Please try again later, or reach Ian directly at ianronk0@gmail.com."
                ),
                "category": top_category,
            }
        )

    try:
        reply = _call_minimax(context, message)
    except requests.RequestException as exc:
        return JsonResponse({"error": f"MiniMax error: {exc}"}, status=502)

    # Off-topic detection — MiniMax signals with the single word OFFTOPIC
    if reply.strip().upper() == "OFFTOPIC":
        block_ip(ip)
        return JsonResponse({"reply": OFF_TOPIC_REPLY, "blocked": True})

    return JsonResponse({"reply": reply, "category": top_category})
