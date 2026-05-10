// models.js — static model list per auth tier
const MODELS = {
  hf: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B',  ctx: 131072 },
    { id: 'Qwen/Qwen3-32B',                     name: 'Qwen3 32B',      ctx: 131072 },
    { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', name: 'Qwen3 235B',     ctx: 131072 },
    { id: 'meta-llama/Llama-3.1-8B-Instruct',  name: 'Llama 3.1 8B',   ctx: 131072 },
    { id: 'Qwen/Qwen2.5-7B-Instruct',           name: 'Qwen 2.5 7B',    ctx: 131072 },
  ],
  github: [
    { id: 'gpt-4o-mini',                      name: 'GPT-4o mini',    ctx: 128000 },
    { id: 'meta-llama-3.3-70b-instruct',       name: 'Llama 3.3 70B', ctx: 131072 },
    { id: 'Phi-4',                             name: 'Phi-4',          ctx: 16384  },
    { id: 'mistral-small-2503',                name: 'Mistral Small',  ctx: 32768  },
    { id: 'AI21-Jamba-1.5-Mini',               name: 'Jamba Mini',     ctx: 256000 },
  ],
  anthropic: [
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', ctx: 200000 },
    { id: 'claude-sonnet-4-6',         name: 'Claude Sonnet 4.6', ctx: 200000 },
    { id: 'claude-opus-4-7',           name: 'Claude Opus 4.7',  ctx: 200000 },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', ctx: 128000 },
    { id: 'gpt-4o',      name: 'GPT-4o',      ctx: 128000 },
  ],
  // local = OpenAI-compatible endpoint. Covers Ollama (/v1/), LM Studio, MLX LM, llama.cpp.
  // Model list discovered live from /v1/models or typed manually.
  local: [],
};

// quick-pick URL presets shown in settings for local tier
const LOCAL_PRESETS = [
  { label: 'Ollama',     url: 'http://localhost:11434' },
  { label: 'LM Studio',  url: 'http://localhost:1234'  },
  { label: 'MLX LM',     url: 'http://localhost:8080'  },
];

function defaultModel(tier) {
  return (MODELS[tier] || [])[0]?.id || '';
}

function ctxForModel(tier, modelId) {
  // check BYOK providers first (model id is 'provider:model')
  if (modelId && modelId.includes(':')) {
    const [pid, mid] = modelId.split(':');
    const p = BYOK_PROVIDERS.find(p => p.id === pid);
    return p?.models.find(m => m.id === mid)?.ctx || 131072;
  }
  const found = (MODELS[tier] || []).find(m => m.id === modelId);
  return found?.ctx || 32000;
}

// ── BYOK providers — free API keys, OpenAI-compatible ─────────────────────────
const BYOK_PROVIDERS = [
  { id: 'groq', name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile',       name: 'Llama 3.3 70B',    ctx: 131072 },
      { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout',    ctx: 131072 },
      { id: 'qwen-qwq-32b',                   name: 'Qwen QwQ 32B',     ctx: 131072 },
      { id: 'gemma2-9b-it',                   name: 'Gemma 2 9B',       ctx: 8192   },
      { id: 'llama-3.1-8b-instant',           name: 'Llama 3.1 8B',     ctx: 131072 },
    ]},
  { id: 'gemini', name: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-2.5-flash',      name: 'Gemini 2.5 Flash',      ctx: 1048576 },
      { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash',      ctx: 1048576 },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', ctx: 1048576 },
      { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro',        ctx: 2097152 },
    ]},
  { id: 'mistral', name: 'Mistral',
    url: 'https://api.mistral.ai/v1/chat/completions',
    models: [
      { id: 'mistral-small-latest',  name: 'Mistral Small',  ctx: 32768  },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', ctx: 32768  },
      { id: 'open-mistral-nemo',     name: 'Mistral Nemo',   ctx: 131072 },
      { id: 'open-codestral-mamba',  name: 'Codestral Mamba',ctx: 256000 },
    ]},
  { id: 'cerebras', name: 'Cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    models: [
      { id: 'llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout',  ctx: 131072 },
      { id: 'llama3.1-70b',                   name: 'Llama 3.1 70B',  ctx: 131072 },
      { id: 'llama3.1-8b',                    name: 'Llama 3.1 8B',   ctx: 131072 },
      { id: 'qwen-3-32b',                     name: 'Qwen 3 32B',     ctx: 131072 },
    ]},
  { id: 'sambanova', name: 'SambaNova',
    url: 'https://api.sambanova.ai/v1/chat/completions',
    models: [
      { id: 'Meta-Llama-3.3-70B-Instruct',  name: 'Llama 3.3 70B',  ctx: 131072 },
      { id: 'Meta-Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', ctx: 131072 },
      { id: 'Qwen2.5-72B-Instruct',         name: 'Qwen 2.5 72B',   ctx: 131072 },
      { id: 'DeepSeek-R1',                  name: 'DeepSeek R1',     ctx: 131072 },
    ]},
  { id: 'openrouter', name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (free)', ctx: 131072 },
      { id: 'deepseek/deepseek-r1:free',               name: 'DeepSeek R1 (free)',   ctx: 163840 },
      { id: 'google/gemma-3-27b-it:free',              name: 'Gemma 3 27B (free)',   ctx: 131072 },
      { id: 'mistralai/mistral-7b-instruct:free',      name: 'Mistral 7B (free)',    ctx: 32768  },
      { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini (free)',    ctx: 131072 },
    ]},
];
