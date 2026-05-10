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
    if (!_skin) return;
    try { localStorage.setItem('toto_hist_' + _skin.skinId, JSON.stringify(_history)); } catch(_) {}
  }

  function loadHistory(skinId) {
    try { _history = JSON.parse(localStorage.getItem('toto_hist_' + skinId) || '[]'); } catch(_) { _history = []; }
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
      if (out) { out.innerHTML = ''; _history.forEach(m => appendMsg(m.role === 'user' ? 'user' : 'assistant', m.content)); }
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
    loadHistory(config.skinId);

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

    // inject 📎 🗜️ ⚙️ into skin header (replaces fixed #toto-controls)
    const phRow = card?.querySelector('.ph-row1');
    if (phRow) {
      const ctrl = document.createElement('div');
      ctrl.style.cssText = 'display:flex;gap:4px;flex-shrink:0';
      ctrl.innerHTML =
        `<button class="toto-btn" title="Attach file"        onclick="settings.attachFile()">📎</button>` +
        `<button class="toto-btn" title="Compress history"   onclick="toto.compressHistory()">🗜️</button>` +
        `<button class="toto-btn" title="Settings"           onclick="settings.toggle()">⚙️</button>`;
      phRow.appendChild(ctrl);
    }

    setJewel('on'); // always green in toto
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
           send: doSend, clearHistory: () => { _history = []; saveHistory(); if (_skin) { const out = $(_skin.msgsId); if (out) out.innerHTML = ''; } } };
})();
