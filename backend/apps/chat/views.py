import json
import os

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .knowledge import SYSTEM_PROMPT, block_ip, is_ip_blocked, search_kb_with_category

MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_MODEL = os.environ.get("MINIMAX_MODEL", "abab6.5s-chat")
MINIMAX_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2"

MIN_MESSAGE_LEN = 4
MAX_MESSAGE_LEN = 500

OFF_TOPIC_REPLY = (
    "I can only answer questions about Ian — his work, research, background, "
    "or how to reach him."
)


def _get_ip(request) -> str:
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

    try:
        reply = _call_minimax(context, message)
    except requests.RequestException as exc:
        return JsonResponse({"error": f"MiniMax error: {exc}"}, status=502)

    # Off-topic detection — MiniMax signals with the single word OFFTOPIC
    if reply.strip().upper() == "OFFTOPIC":
        block_ip(ip)
        return JsonResponse({"reply": OFF_TOPIC_REPLY, "blocked": True})

    return JsonResponse({"reply": reply, "category": top_category})
