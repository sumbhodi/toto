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
// ── HF demo config + default persona ────────────────────────────────────────
const HF_PAIR_LIMIT = 10;
const DEFAULT_PERSONA =
`You are a knowledgeable, warm assistant. You know almost everything. You have no persistent memory — each conversation starts completely fresh.

First response only: briefly introduce yourself. Let the user know you start every session with no memory of past chats, and that they can share context about themselves in ⚙️ Settings to make you more useful to them.`;

// chat.js — toto core engine
const toto = (() => {
  const $ = id => document.getElementById(id);
  let _skin = null, _history = [], _controller = null, _busy = false;

  // ── BYOK resolver — 'groq:model-id' → { url, key, model, providerId } ───────
  function resolveBYOK(modelStr) {
    if (!modelStr || !modelStr.includes(':')) return null;
    const sep = modelStr.indexOf(':');
    const pid = modelStr.slice(0, sep);
    const provider = (typeof BYOK_PROVIDERS !== 'undefined') && BYOK_PROVIDERS.find(p => p.id === pid);
    if (!provider) return null;
    return { url: provider.url, key: settings.get(pid + 'Key'), model: modelStr.slice(sep + 1), providerId: pid };
  }

  // ── message rendering ───────────────────────────────────────────────────────
  function appendMsg(role, text) {
    const out = $(_skin.msgsId);
    if (!out) return null;
    const div = document.createElement('div');
    div.className = role === 'user' ? 'oz-msg oz-msg-u' : 'oz-msg oz-msg-bot';
    div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
    return div;
  }

  function updateLastMsg(div, text) {
    if (!div) return;
    div.textContent = text;
    const out = $(_skin.msgsId);
    if (out) out.scrollTop = out.scrollHeight;
  }

  // ── jewel state ─────────────────────────────────────────────────────────────
  function setJewel(state) {
    if (!_skin) return;
    const { skinId } = _skin;
    const g = $(skinId + '-jsg'), a = $(skinId + '-jsa'), r = $(skinId + '-jsr');
    if (!g) return;
    g.classList.remove('lit', 'blinking');
    a.classList.remove('lit', 'blinking');
    r.classList.remove('lit', 'blinking');
    if (state === 'on')      { g.classList.add('lit'); }
    if (state === 'waiting') { a.classList.add('lit', 'blinking'); }
    if (state === 'error')   { r.classList.add('lit'); }
  }

  // ── HF demo helpers ─────────────────────────────────────────────────────────
  function isHFDemo() { return window.location.hostname.endsWith('.hf.space'); }
  function isMommaMode() { return (settings.get('userName') || '').toLowerCase() === 'momma'; }
  function getHFPairs() { return parseInt(sessionStorage.getItem('toto_hf_pairs') || '0'); }
  function bumpHFPairs() { const n = getHFPairs() + 1; sessionStorage.setItem('toto_hf_pairs', String(n)); return n; }
  function isDefaultPersona() { const p = settings.get('persona'); return !p || p === DEFAULT_PERSONA; }

  function showPair1Nudge() {
    appendMsg('assistant',
      `🆓 Demo mode — ${HF_PAIR_LIMIT} free pairs, shared tokens. Leave some for the next person.\n\n` +
      `Liked it? Get your own free API key for unlimited conversations:\n` +
      `⚙️ Settings → 🔑 Free API Keys  (Groq, Gemini, Mistral and more — all free, no credit card)\n\n` +
      `"I'm gonna build my own chatbot — with blackjack and API keys!"  — Bender`);
  }

  function showPair5Nudge() {
    appendMsg('assistant',
      `⏳ Halfway there — 5 of ${HF_PAIR_LIMIT} free pairs used.\n\n` +
      `If toto is useful, grab your own free API key and never hit this wall:\n` +
      `⚙️ Settings → 🔑 Free API Keys — Groq, Gemini, Mistral and more.`);
  }

  function showPair9Warn() {
    appendMsg('assistant',
      `⚠️ Last pair — 9 of ${HF_PAIR_LIMIT} used. Next message ends the demo session.\n\n` +
      `⚙️ Settings → 🔑 Free API Keys to continue without interruption.`);
  }

  function showHFBlock() {
    appendMsg('assistant',
      `⏸ ${HF_PAIR_LIMIT} free pairs used this session.\n\n` +
      `Refresh for ${HF_PAIR_LIMIT} more — or get your own free API key for unlimited conversations.\n` +
      `Takes 2 minutes. No credit card needed.\n\n` +
      `Opening Settings → 🔑 Free API Keys now…`);
    setTimeout(() => settings.scrollToBYOK(), 500);
  }

  function updateHFCounter() {
    if (!_skin) return;
    const el = document.getElementById(_skin.skinId + '-hf-count');
    if (el) el.textContent = isMommaMode() ? '∞' : getHFPairs() + '/' + HF_PAIR_LIMIT;
  }

  // ── executive summary — always-visible injection at top of chat ─────────────
  function showExecSummary() {
    if (!_skin) return;
    const out = $(_skin.msgsId);
    if (!out) return;
    const existing = out.querySelector('.toto-exec-summary');
    if (existing) existing.remove();
    const sys = settings.getSystemPrompt();
    if (!sys) return;
    const gb = document.createElement('div');
    gb.className = 'oz-msg oz-msg-bot toto-exec-summary';
    gb.textContent = 'executive summary\n\n' + sys;
    out.insertBefore(gb, out.firstChild);
  }

  // ── history + trim ──────────────────────────────────────────────────────────
  function roughTokens(text) { return Math.ceil(text.length / 4); }

  function trimHistory(ctx) {
    const pairsOverride = parseInt(settings.get('pairsOverride') || '0');
    if (pairsOverride > 0) {
      _history = _history.slice(-pairsOverride * 2);
      return;
    }
    const maxTok = Math.max(ctx - 5000, ctx * 0.8);
    let total = 0;
    for (let i = _history.length - 1; i >= 0; i--) {
      total += roughTokens(_history[i].content);
      if (total > maxTok) { _history = _history.slice(i + 1); return; }
    }
  }

  function saveHistory() {
    try { localStorage.setItem('toto_hist', JSON.stringify(_history)); } catch(_) {}
  }

  function loadHistory() {
    try { _history = JSON.parse(localStorage.getItem('toto_hist') || '[]'); } catch(_) { _history = []; }
  }

  // ── compress ────────────────────────────────────────────────────────────────
  async function compressHistory() {
    if (_busy || _history.length < 6) return;
    const auth = settings.getAuth();
    const model = settings.getModel();
    const head = _history.slice(0, 2);
    const tail = _history.slice(-4);
    const middle = _history.slice(2, -4);
    if (!middle.length) return;
    const prompt = 'Summarize this conversation excerpt. Keep: key decisions, open questions, important context. Drop: pleasantries. Plain text, under 300 words.\n\n' +
      middle.map(m => (m.role === 'user' ? 'User: ' : 'AI: ') + m.content).join('\n');
    try {
      const summary = await oneshot(auth, model, prompt);
      _history = [...head, { role: 'assistant', content: '[compressed]\n' + summary }, ...tail];
      saveHistory();
      const out = $(_skin.msgsId);
      if (out) { out.innerHTML = ''; _history.forEach(m => appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content)); showExecSummary(); }
    } catch(e) { console.error('compress failed', e); }
  }

  // ── streaming helpers ───────────────────────────────────────────────────────
  async function readSSE(resp, onChunk) {
    const reader = resp.body.getReader(), dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return;
        try {
          const j = JSON.parse(raw);
          const chunk = j.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch(_) {}
      }
    }
  }

  async function streamOpenAI(url, key, model, messages, sys, onChunk, signal) {
    const resp = await fetch(url, {
      signal,
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: true,
        messages: [{ role: 'system', content: sys }, ...messages] })
    });
    if (!resp.ok) throw new Error(await resp.text());
    await readSSE(resp, onChunk);
  }

  async function streamAnthropic(key, model, messages, sys, onChunk, signal) {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      signal,
      method: 'POST',
      headers: {
        'x-api-key': key, 'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({ model, system: sys, stream: true, max_tokens: 8192, messages })
    });
    if (!resp.ok) throw new Error(await resp.text());
    const reader = resp.body.getReader(), dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const j = JSON.parse(line.slice(6));
          if (j.type === 'content_block_delta') onChunk(j.delta?.text || '');
        } catch(_) {}
      }
    }
  }

  async function streamOllama(url, model, messages, sys, onChunk, signal) {
    const resp = await fetch(url + '/api/chat', {
      signal, method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: true,
        messages: [{ role: 'system', content: sys }, ...messages] })
    });
    if (!resp.ok) throw new Error(await resp.text());
    const reader = resp.body.getReader(), dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const j = JSON.parse(line);
          if (j.message?.content) onChunk(j.message.content);
        } catch(_) {}
      }
    }
  }

  async function oneshot(auth, model, prompt) {
    const sys = 'You are a helpful assistant.';
    let text = '';
    const noop = () => {};
    const ctrl = new AbortController();
    if (auth.tier === 'anthropic') {
      await streamAnthropic(auth.key, model, [{ role: 'user', content: prompt }], sys, c => text += c, ctrl.signal);
    } else {
      const url = auth.tier === 'github'  ? 'https://models.inference.ai.azure.com/chat/completions'
                : auth.tier === 'hf'      ? '/v1/chat/completions'
                : auth.tier === 'local'   ? auth.url.replace(/\/$/, '') + '/v1/chat/completions'
                :                           'https://api.openai.com/v1/chat/completions';
      await streamOpenAI(url, auth.key || '', model, [{ role: 'user', content: prompt }], sys, c => text += c, ctrl.signal);
    }
    return text;
  }

  // ── main send ───────────────────────────────────────────────────────────────
  async function doSend(extraText) {
    const inp = $(_skin.inputId);
    const text = (extraText || inp?.value || '').trim();
    if (!text || _busy) return;
    if (isHFDemo() && !isMommaMode() && getHFPairs() >= HF_PAIR_LIMIT) { showHFBlock(); return; }
    if (inp) inp.value = '';

    const auth = settings.getAuth();
    const model = settings.getModel();

    // resolve BYOK provider from model prefix (e.g. 'groq:llama-3.3-70b-versatile')
    const byok = resolveBYOK(model);
    if (!byok && !auth.key && auth.tier !== 'local' && auth.tier !== 'hf') {
      appendMsg('assistant', '[No API key — open ⚙️ settings and add one.]');
      return;
    }
    if (byok && !byok.key) {
      appendMsg('assistant', `[No key for ${byok.providerId} — add it in ⚙️ settings → Free API Keys]`);
      return;
    }

    const paperclip = window._totoClip || '';
    window._totoClip = '';
    const userText = paperclip ? '[File]\n' + paperclip + '\n\n' + text : text;

    appendMsg('user', userText);
    _history.push({ role: 'user', content: userText });

    const sys = settings.getSystemPrompt();
    const ctx = ctxForModel(auth.tier, model);
    trimHistory(ctx);
    saveHistory();

    setJewel('waiting');
    _busy = true;
    _controller = new AbortController();
    const botDiv = appendMsg('assistant', '');

    try {
      let botText = '';
      const onChunk = chunk => { botText += chunk; updateLastMsg(botDiv, botText); };

      if (byok) {
        await streamOpenAI(byok.url, byok.key, byok.model, _history, sys, onChunk, _controller.signal);
      } else if (auth.tier === 'anthropic') {
        await streamAnthropic(auth.key, model, _history, sys, onChunk, _controller.signal);
      } else {
        const url = auth.tier === 'github'  ? 'https://models.inference.ai.azure.com/chat/completions'
                  : auth.tier === 'hf'      ? '/v1/chat/completions'
                  : auth.tier === 'local'   ? auth.url.replace(/\/$/, '') + '/v1/chat/completions'
                  :                           'https://api.openai.com/v1/chat/completions';
        await streamOpenAI(url, auth.key || '', model, _history, sys, onChunk, _controller.signal);
      }

      _history.push({ role: 'assistant', content: botText });
      saveHistory();
      setJewel('on');
      if (isHFDemo()) {
        const pairs = bumpHFPairs();
        updateHFCounter();
        if (isMommaMode()) {
          if (pairs === 1) appendMsg('assistant',
            `👋 Hey! Fill in ⚙️ Settings → your name, who you are, how you think. The more you share, the better I can help. No rush — I'll be here.`);
        } else {
          if (pairs === 1) showPair1Nudge();
          if (pairs === 5) showPair5Nudge();
          if (pairs === 9) showPair9Warn();
        }
      }
    } catch(e) {
      if (e.name !== 'AbortError') {
        updateLastMsg(botDiv, '[error: ' + e.message + ']');
        setJewel('error');
      } else {
        setJewel('on');
      }
    }
    _busy = false;
    _controller = null;
  }

  // ── mount (called by skin JS after injecting HTML) ──────────────────────────
  function mount(config) {
    _skin = config;
    loadHistory();

    // render persisted history to display
    const out = $(config.msgsId);
    if (out && _history.length) {
      _history.forEach(m => appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content));
    }

    const inp = $(config.inputId);
    const send = $(config.sendId);
    const stop = $(config.stopId);
    const card = $(config.cardId);

    // Enter = newline (no send-on-enter — use the send button)
    if (send) send.onclick = () => doSend();
    if (stop) stop.onclick = () => { _controller?.abort(); setJewel('on'); _busy = false; };

    // power toggle
    window[config.skinId + 'PowerToggle'] = () => {
      if (!card) return;
      const on = card.classList.toggle('powered-off');
      const lever = $(config.skinId + '-lever');
      if (lever) lever.classList.toggle('on', !on);
      setJewel(on ? 'off' : 'on');
      if (!on && config.warmup) { setTimeout(() => doSend(config.warmup), 0); }
    };

    // keyboard toggle (historian/radio only)
    if (config.kbToggleId) {
      const kbBtn = $(config.kbToggleId);
      const floor = $(config.floorId);
      if (kbBtn && floor) {
        kbBtn.onclick = () => {
          const showing = floor.style.display !== 'none';
          floor.style.display = showing ? 'none' : '';
          kbBtn.classList.toggle('on', !showing);
        };
      }
    }

    // inject 📎 🗜️ ⚙️ [X/10] into skin header + click empty topbar to collapse
    const phRow = card?.querySelector('.ph-row1');
    if (phRow) {
      const ctrl = document.createElement('div');
      ctrl.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0';
      const hfCountHtml = isHFDemo()
        ? `<span id="${config.skinId}-hf-count" style="font-size:13px;opacity:0.55;padding-right:2px">${isMommaMode() ? '∞' : getHFPairs() + '/' + HF_PAIR_LIMIT}</span>`
        : '';
      ctrl.innerHTML =
        hfCountHtml +
        `<button class="toto-btn" title="Attach file"      onclick="settings.attachFile()">📎</button>` +
        `<button class="toto-btn" title="Compress history" onclick="toto.compressHistory()">🗜️</button>` +
        `<button class="toto-btn" title="Settings"         onclick="settings.toggle()">⚙️</button>`;
      phRow.appendChild(ctrl);
      phRow.style.cursor = 'pointer';
      phRow.addEventListener('click', e => {
        if (e.target.closest('button, input, select, a')) return;
        card.classList.toggle('toto-collapsed');
      });
    }

    setJewel('on'); // always green in toto
    showExecSummary(); // always-visible injection at top of chat
  }

  // ── mountToggle — shared input reveal utility ──────────────────────────────
  // toggleId:    the button/icon element id
  // inputWrapId: the element to show/hide
  // focusId:     optional — element to focus when opened
  // displayValue: css display value when open (default 'flex', use 'block' for absolute panels)
  function mountToggle({ toggleId, inputWrapId, focusId, displayValue = 'flex' }) {
    const toggleEl  = document.getElementById(toggleId);
    const inputWrap = document.getElementById(inputWrapId);
    if (!toggleEl || !inputWrap) return;

    toggleEl.addEventListener('click', () => {
      const isOpen = inputWrap.style.display !== 'none';
      inputWrap.style.display = isOpen ? 'none' : displayValue;
      if (!isOpen && focusId) {
        const el = document.getElementById(focusId);
        if (el) el.focus();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && inputWrap.style.display !== 'none')
        inputWrap.style.display = 'none';
    });
  }

  // ── mountResize — shared slider resize utility ─────────────────────────────
  // sliderId: the drag handle element id
  // topId:    the output/messages element id (height controlled by drag)
  // minTop:   minimum px for top element   (default 60)
  // minBottom:minimum px for bottom element (default 60)
  function mountResize({ sliderId, topId, minTop = 60, minBottom = 60 }) {
    const sliderEl = document.getElementById(sliderId);
    const topEl    = document.getElementById(topId);
    if (!sliderEl || !topEl) return;

    sliderEl.addEventListener('pointerdown', e => {
      const startY = e.clientY;
      const startH = topEl.getBoundingClientRect().height;
      topEl.style.flex      = 'none';
      topEl.style.minHeight = '0';
      topEl.style.height    = startH + 'px';
      sliderEl.setPointerCapture(e.pointerId);

      sliderEl.onpointermove = mv => {
        const container  = sliderEl.parentElement;
        const containerH = container.getBoundingClientRect().height;
        const header     = container.querySelector('.ph');
        const headerH    = header ? header.getBoundingClientRect().height : 0;
        const sliderH    = sliderEl.getBoundingClientRect().height;
        const maxH       = containerH - headerH - sliderH - minBottom;
        topEl.style.height = Math.max(minTop, Math.min(maxH, startH + (mv.clientY - startY))) + 'px';
      };

      sliderEl.onpointerup = () => {
        sliderEl.onpointermove = null;
        sliderEl.onpointerup   = null;
      };
      e.preventDefault();
    });
  }

  return { mount, mountResize, mountToggle, setJewel, appendMsg, updateLastMsg, compressHistory,
           send: doSend, clearHistory: () => { _history = []; saveHistory(); if (_skin) { const out = $(_skin.msgsId); if (out) out.innerHTML = ''; showExecSummary(); } } };
})();
