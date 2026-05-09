// settings.js — gear drawer, localStorage, system prompt, skin loader
const settings = (() => {
  const K = {
    skin: 'toto_skin', model: 'toto_model', authTier: 'toto_auth_tier',
    persona: 'toto_persona', userBio: 'toto_user_bio', project: 'toto_project',
    githubPat: 'toto_github_pat', anthropicKey: 'toto_anthropic_key',
    openaiKey: 'toto_openai_key', ollamaUrl: 'toto_ollama_url',
    pairsOverride: 'toto_pairs_override',
  };

  const get = key => localStorage.getItem(K[key]) || '';
  const set = (key, val) => localStorage.setItem(K[key], val);

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

    const modelSection = `<div class="sg-row">
      <label>Model ${(!onHF && tier==='local')?'<button class="sg-discover" onclick="settings.discoverModels()">↻ discover</button>':''}</label>
      ${(!onHF && tier==='local')
        ? `<input id="sg-model-input" type="text" placeholder="model name e.g. llama3.2"
             value="${modelId}" onchange="settings.onModelChange(this.value)">`
        : `<select id="sg-model" onchange="${onHF?'settings.onHFModelChange':'settings.onModelChange'}(this.value)">
             ${tierModels.map(m => `<option value="${m.id}" ${m.id===modelId?'selected':''}>${m.name}</option>`).join('')}
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
    d.innerHTML = drawerHTML();
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
  }

  return { get, set, getAuth, getModel, getSystemPrompt, toggle, init,
           onSkinChange, onTierChange, onKeyChange, onUrlChange, onUrlPreset,
           onModelChange, onHFModelChange, onField, clearHistory, loadSkin, attachFile, discoverModels };
})();
