import json
import os

import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .knowledge import SYSTEM_PROMPT, search_kb

MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY", "")
MINIMAX_MODEL = os.environ.get("MINIMAX_MODEL", "abab6.5s-chat")
MINIMAX_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2"

MAX_MESSAGE_LEN = 500


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

    message = str(body.get("message", "")).strip()[:MAX_MESSAGE_LEN]
    if not message:
        return JsonResponse({"error": "message required"}, status=400)

    chunks = search_kb(message)
    context = "\n\n".join(chunks) if chunks else "No specific context found."

    if not MINIMAX_API_KEY:
        return JsonResponse(
            {
                "reply": (
                    "The AI assistant is not yet configured on this server. "
                    "Set MINIMAX_API_KEY in the backend environment to enable it."
                )
            }
        )

    try:
        reply = _call_minimax(context, message)
    except requests.RequestException as exc:
        return JsonResponse({"error": f"MiniMax error: {exc}"}, status=502)

    return JsonResponse({"reply": reply})
