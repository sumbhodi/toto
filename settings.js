// settings.js — gear drawer, localStorage, system prompt, skin loader
const settings = (() => {
  const K = {
    skin: 'toto_skin', model: 'toto_model', authTier: 'toto_auth_tier',
    persona: 'toto_persona', userBio: 'toto_user_bio', project: 'toto_project',
    githubPat: 'toto_github_pat', anthropicKey: 'toto_anthropic_key',
    openaiKey: 'toto_openai_key', ollamaUrl: 'toto_ollama_url',
    pairsOverride: 'toto_pairs_override',
  };

  const get = key => localStorage.getItem(K[key] || 'toto_' + key) || '';
  const set = (key, val) => localStorage.setItem(K[key] || 'toto_' + key, val);

  function getAuth() {
    if (window.location.hostname.endsWith('.hf.space')) {
      return { tier: 'hf', key: '', url: '' };
    }
    const tier = get('authTier') || 'github';
    const keyMap = { github: get('githubPat'), anthropic: get('anthropicKey'), openai: get('openaiKey'), local: '' };
    return { tier, key: keyMap[tier] || '', url: get('localUrl') || 'http://localhost:11434' };
  }

  function getModel() {
    if (window.location.hostname.endsWith('.hf.space')) {
      return get('hfModel') || defaultModel('hf');
    }
    return get('model') || defaultModel(getAuth().tier);
  }

  function getSystemPrompt() {
    const persona = get('persona') || 'You are a helpful, warm assistant.';
    const bio = get('userBio');
    const proj = get('project');
    let s = persona;
    if (bio)  s += '\n\nUser: ' + bio;
    if (proj) s += '\n\nProject context: ' + proj;
    return s;
  }

  // ── skin loader ─────────────────────────────────────────────────────────────
  let _currentSkin = null;

  function loadSkin(skinId) {
    if (skinId === _currentSkin) return;
    _currentSkin = skinId;
    set('skin', skinId);

    const mount = document.getElementById('skin-mount');
    mount.innerHTML = '';

    ['toto-skin-css', 'toto-skin-js'].forEach(id => document.getElementById(id)?.remove());

    const link = document.createElement('link');
    link.id = 'toto-skin-css'; link.rel = 'stylesheet';
    link.href = 'skins/' + skinId + '/' + skinId + '.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'toto-skin-js';
    script.src = 'skins/' + skinId + '/' + skinId + '.js?' + Date.now();
    document.head.appendChild(script);
  }

  // ── drawer HTML ─────────────────────────────────────────────────────────────
  function drawerHTML() {
    const onHF  = window.location.hostname.endsWith('.hf.space');
    const tier  = onHF ? 'hf' : (get('authTier') || 'github');
    const skin  = get('skin') || 'beach';
    const skins = ['beach','neo','analog','historian','phone'];
    // close button injected at top of drawer
    const hfModelId = get('hfModel') || MODELS.hf[0]?.id || '';
    const modelId   = onHF ? hfModelId : getModel();
    const tierModels = onHF ? MODELS.hf : (MODELS[tier] || []);

    const authSection = onHF
      ? `<div class="sg-row">
           <label>Auth</label>
           <div class="sg-hint" style="padding:4px 0">Hugging Face free tier · no key needed</div>
         </div>`
      : `<div class="sg-row">
           <label>Auth</label>
           <select id="sg-tier" onchange="settings.onTierChange(this.value)">
             <option value="github"    ${tier==='github'?'selected':''}>GitHub Models (free)</option>
             <option value="anthropic" ${tier==='anthropic'?'selected':''}>BYOK — Anthropic</option>
             <option value="openai"    ${tier==='openai'?'selected':''}>BYOK — OpenAI</option>
             <option value="local"     ${tier==='local'?'selected':''}>Local (Ollama · LM Studio · MLX)</option>
           </select>
         </div>
         <div class="sg-row" id="sg-key-row" ${tier==='local'?'style="display:none"':''}>
           <label>${tier==='anthropic'?'Anthropic key':tier==='openai'?'OpenAI key':'GitHub PAT'}</label>
           <input id="sg-key" type="password" placeholder="paste key…"
             value="${tier==='anthropic'?get('anthropicKey'):tier==='openai'?get('openaiKey'):get('githubPat')}"
             onchange="settings.onKeyChange(this.value)">
         </div>
         <div class="sg-row" id="sg-url-row" ${tier!=='local'?'style="display:none"':''}>
           <label>Local server URL</label>
           <div class="sg-presets">
             ${LOCAL_PRESETS.map(p => `<button class="sg-preset" onclick="settings.onUrlPreset('${p.url}')">${p.label}</button>`).join('')}
           </div>
           <input id="sg-url" type="text" placeholder="http://localhost:11434"
             value="${get('localUrl')}" onchange="settings.onUrlChange(this.value)">
         </div>`;

    // BYOK models appended to selector when keys are present
    const byokGroups = BYOK_PROVIDERS
      .filter(p => get(p.id + 'Key'))
      .map(p => `<optgroup label="── ${p.name} ──">
        ${p.models.map(m => {
          const val = p.id + ':' + m.id;
          return `<option value="${val}" ${val===modelId?'selected':''}>${m.name}</option>`;
        }).join('')}
      </optgroup>`).join('');

    const modelSection = `<div class="sg-row">
      <label>Model ${(!onHF && tier==='local')?'<button class="sg-discover" onclick="settings.discoverModels()">↻ discover</button>':''}</label>
      ${(!onHF && tier==='local')
        ? `<input id="sg-model-input" type="text" placeholder="model name e.g. llama3.2"
             value="${modelId}" onchange="settings.onModelChange(this.value)">`
        : `<select id="sg-model" onchange="${onHF?'settings.onHFModelChange':'settings.onModelChange'}(this.value)">
             ${tierModels.map(m => `<option value="${m.id}" ${m.id===modelId?'selected':''}>${m.name}</option>`).join('')}
             ${byokGroups}
           </select>`
      }
    </div>`;

    return `
<div id="settings-inner">
  <div class="sg-row">
    <label>Skin</label>
    <select id="sg-skin" onchange="settings.onSkinChange(this.value)">
      ${skins.map(s => `<option value="${s}" ${s===skin?'selected':''}>${s}</option>`).join('')}
    </select>
  </div>
  ${authSection}
  ${modelSection}
  <div class="sg-sep"></div>
  <div class="sg-row">
    <label>Persona</label>
    <textarea id="sg-persona" rows="3" onchange="settings.onField('persona',this.value)"
      placeholder="You are a helpful assistant.">${get('persona')}</textarea>
  </div>
  <div class="sg-row">
    <label>User bio</label>
    <textarea id="sg-bio" rows="2" onchange="settings.onField('userBio',this.value)"
      placeholder="Who you are (2–3 sentences).">${get('userBio')}</textarea>
  </div>
  <div class="sg-row">
    <label>Project</label>
    <textarea id="sg-project" rows="2" onchange="settings.onField('project',this.value)"
      placeholder="Current task or context (optional).">${get('project')}</textarea>
  </div>
  <div class="sg-sep"></div>
  <div class="sg-row">
    <label>Font size</label>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <button class="sg-preset" onclick="settings.stepFontSize(-2)" style="font-size:18px;padding:2px 10px">−</button>
      <input id="sg-fontsize" type="number" min="8" max="64"
        value="${parseInt(get('fontSize'))||28}"
        style="width:64px;text-align:center"
        onchange="settings.setFontSize(this.value)">
      <button class="sg-preset" onclick="settings.stepFontSize(2)" style="font-size:18px;padding:2px 10px">+</button>
      <button class="sg-preset" onclick="settings.setFontSize(8)">8</button>
      <button class="sg-preset" onclick="settings.setFontSize(12)">12</button>
      <button class="sg-preset" onclick="settings.setFontSize(16)">16</button>
      <button class="sg-preset" onclick="settings.setFontSize(28)">28</button>
    </div>
  </div>
  <div class="sg-sep"></div>

  <details class="sg-byok">
    <summary class="sg-byok-title">🔑 Free API Keys <span class="sg-byok-hint">— unlock more models</span></summary>
    <div class="sg-byok-body">

      <details class="sg-tutorial">
        <summary class="sg-tutorial-title">📖 What is an API key?</summary>
        <div class="sg-tutorial-body">
          <p>An API key is a password that lets toto talk to an AI service on your behalf. Each provider gives you one free — no credit card needed.</p>
          <ol>
            <li>Click a <strong>Sign up</strong> link below</li>
            <li>Create a free account</li>
            <li>Find <strong>API Keys</strong> in their dashboard</li>
            <li>Click <strong>Create / Generate key</strong></li>
            <li>Copy the key and paste it into the field here</li>
          </ol>
          <p class="sg-hint">Keys are stored only in your browser. toto never sees them server-side.</p>
        </div>
      </details>

      <div class="sg-byok-providers">
        ${[
          { id:'groq',        name:'Groq',        url:'https://console.groq.com/keys',             placeholder:'gsk_...' },
          { id:'mistral',     name:'Mistral',      url:'https://console.mistral.ai/api-keys',       placeholder:'...' },
          { id:'cerebras',    name:'Cerebras',     url:'https://cloud.cerebras.ai',                 placeholder:'csk-...' },
          { id:'sambanova',   name:'SambaNova',    url:'https://cloud.sambanova.ai/apis',           placeholder:'...' },
          { id:'openrouter',  name:'OpenRouter',   url:'https://openrouter.ai/keys',               placeholder:'sk-or-...' },
          { id:'gemini',      name:'Gemini',       url:'https://aistudio.google.com/apikey',        placeholder:'AIza...' },
        ].map(p => `
        <div class="sg-byok-row">
          <span class="sg-byok-name">${p.name}</span>
          <a class="sg-byok-link" href="${p.url}" target="_blank" rel="noopener">Sign up ↗</a>
          <input type="password" class="sg-byok-input" placeholder="${p.placeholder}"
            value="${get(p.id+'Key')}"
            oninput="settings.set('${p.id}Key', this.value)">
        </div>`).join('')}
      </div>

      <button class="sg-preset" style="margin-top:10px;width:100%;padding:8px 0;font-size:var(--fs-tab)"
        onclick="settings.openDrawer()">↻ Update available models</button>

    </div>
  </details>

  <div class="sg-sep"></div>
  <div class="sg-row">
    <label>Keep pairs</label>
    <input id="sg-pairs" type="number" min="0" placeholder="auto"
      value="${get('pairsOverride')}" onchange="settings.onField('pairsOverride',this.value)">
    <span class="sg-hint">0 = auto trim by context window</span>
  </div>
  <div class="sg-row">
    <button class="sg-btn-danger" onclick="settings.clearHistory()">Clear history</button>
  </div>
</div>`;
  }

  function openDrawer() {
    const d = document.getElementById('settings-drawer');
    d.innerHTML = `<button onclick="settings.toggle()" style="position:sticky;top:0;float:right;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);border-radius:5px;padding:4px 10px;cursor:pointer;font-size:18px;margin:8px 8px 0 0;z-index:10">✕</button>` + drawerHTML();
    d.classList.add('open');
  }
  function closeDrawer() {
    document.getElementById('settings-drawer').classList.remove('open');
  }
  function toggle() {
    const d = document.getElementById('settings-drawer');
    d.classList.contains('open') ? closeDrawer() : openDrawer();
  }

  // ── change handlers ─────────────────────────────────────────────────────────
  function onSkinChange(val) { loadSkin(val); closeDrawer(); }
  function onTierChange(val) {
    set('authTier', val);
    set('model', defaultModel(val));
    openDrawer();
  }
  function onKeyChange(val) {
    const tier = get('authTier') || 'github';
    const keyK = tier === 'anthropic' ? 'anthropicKey' : tier === 'openai' ? 'openaiKey' : 'githubPat';
    set(keyK, val);
  }
  function onUrlChange(val) { set('localUrl', val); }
  function onUrlPreset(url) {
    set('localUrl', url);
    const inp = document.getElementById('sg-url');
    if (inp) inp.value = url;
    discoverModels();
  }
  async function discoverModels() {
    const url = (get('localUrl') || 'http://localhost:11434').replace(/\/$/, '');
    const inp = document.getElementById('sg-model-input');
    if (inp) inp.placeholder = 'discovering…';
    try {
      const resp = await fetch(url + '/v1/models');
      if (!resp.ok) throw new Error();
      const json = await resp.json();
      const ids = (json.data || []).map(m => m.id);
      if (inp && ids.length) { inp.placeholder = ids[0]; inp.value = ids[0]; set('model', ids[0]); }
      // populate MODELS.local for ctxForModel lookups
      MODELS.local = ids.map(id => ({ id, name: id, ctx: 32000 }));
    } catch(_) {
      if (inp) inp.placeholder = 'enter model name manually';
    }
  }
  function onModelChange(val) { set('model', val); }
  function onHFModelChange(val) { set('hfModel', val); }
  function onField(key, val) { set(key, val); }
  function clearHistory() { toto.clearHistory(); closeDrawer(); }

  // ── font size ────────────────────────────────────────────────────────────────
  function setFontSize(val) {
    val = Math.max(8, Math.min(64, parseInt(val) || 28));
    // scale all font vars proportionally from base 28
    document.documentElement.style.setProperty('--fs-body',  val + 'px');
    document.documentElement.style.setProperty('--fs-label', Math.round(val * 0.714) + 'px');
    document.documentElement.style.setProperty('--fs-tab',   Math.round(val * 0.643) + 'px');
    document.documentElement.style.setProperty('--fs-title', Math.round(val * 1.071) + 'px');
    set('fontSize', val);
    const inp = document.getElementById('sg-fontsize');
    if (inp) inp.value = val;
  }
  function stepFontSize(delta) {
    const cur = parseInt(get('fontSize')) || 28;
    setFontSize(cur + delta);
  }

  // ── paperclip ───────────────────────────────────────────────────────────────
  function attachFile() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.txt,.md,.json,.js,.py,.css,.html,.csv';
    inp.onchange = () => {
      const file = inp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        window._totoClip = file.name + '\n' + e.target.result.slice(0, 12000);
        const btn = document.getElementById('btn-clip');
        if (btn) { btn.style.opacity = '1'; btn.title = 'File ready: ' + file.name; }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  // ── init ────────────────────────────────────────────────────────────────────
  function init() {
    const skin = get('skin') || 'beach';
    loadSkin(skin);
    const savedSize = get('fontSize');
    if (savedSize) setFontSize(savedSize);
  }

  return { get, set, getAuth, getModel, getSystemPrompt, toggle, openDrawer, init,
           onSkinChange, onTierChange, onKeyChange, onUrlChange, onUrlPreset,
           onModelChange, onHFModelChange, onField, clearHistory, loadSkin, attachFile, discoverModels,
           setFontSize, stepFontSize };
})();
