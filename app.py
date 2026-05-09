import os, json
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

HF_TOKEN      = os.environ.get('HF_TOKEN', '')
HF_API        = 'https://router.huggingface.co/v1/chat/completions'
DEFAULT_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

@app.post('/v1/chat/completions')
async def proxy(request: Request):
    body = await request.body()
    try:
        parsed = json.loads(body)
        if not parsed.get('model'):
            parsed['model'] = DEFAULT_MODEL
            body = json.dumps(parsed).encode()
    except Exception:
        pass

    async def stream():
        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream('POST', HF_API,
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
