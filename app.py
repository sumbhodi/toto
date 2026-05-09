import os, json
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

HF_TOKEN   = os.environ.get('HF_TOKEN', '')
HF_BASE    = 'https://api-inference.huggingface.co/models'
DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'

@app.post('/v1/chat/completions')
async def proxy(request: Request):
    body = await request.body()
    try:
        model = json.loads(body).get('model', DEFAULT_MODEL)
    except Exception:
        model = DEFAULT_MODEL
    hf_url = f'{HF_BASE}/{model}/v1/chat/completions'

    async def stream():
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream('POST', hf_url,
                content=body,
                headers={
                    'Authorization': f'Bearer {HF_TOKEN}',
                    'Content-Type': 'application/json',
                }) as resp:
                if resp.status_code != 200:
                    error = await resp.aread()
                    msg = f'[HF {resp.status_code}: {error.decode()[:300]}]'
                    yield f'data: {json.dumps({"choices":[{"delta":{"content":msg}}]})}\n\n'.encode()
                    yield b'data: [DONE]\n\n'
                    return
                async for chunk in resp.aiter_bytes():
                    yield chunk

    return StreamingResponse(
        stream(),
        media_type='text/event-stream',
        headers={'X-Accel-Buffering': 'no', 'Cache-Control': 'no-cache'},
    )

app.mount('/', StaticFiles(directory='.', html=True), name='static')
