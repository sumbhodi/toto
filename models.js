// models.js — static model list per auth tier
const MODELS = {
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
  const found = (MODELS[tier] || []).find(m => m.id === modelId);
  return found?.ctx || 32000;
}
