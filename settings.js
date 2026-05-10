// settings.js — gear drawer, localStorage, system prompt, skin loader
const settings = (() => {
  const K = {
    skin: 'toto_skin', model: 'toto_model', authTier: 'toto_auth_tier',
    persona: 'toto_persona', project: 'toto_project',
    githubPat: 'toto_github_pat', anthropicKey: 'toto_anthropic_key',
    openaiKey: 'toto_openai_key', pairsOverride: 'toto_pairs_override',
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
    const parts = [];

    // ── bot personality ─────────────────────────────────────────────────────
    const persona = get('persona') || 'You are a helpful, warm assistant.';
    parts.push(persona);
    const botName      = get('botName');
    const botPronouns  = get('botPronouns');
    const botBackstory = get('botBackstory');
    if (botName)      parts.push('Your name is ' + botName + '.');
    if (botPronouns)  parts.push('Your pronouns are ' + botPronouns + '.');
    if (botBackstory) parts.push('Backstory: ' + botBackstory);

    // ── user (wetware node) ─────────────────────────────────────────────────
    const uName      = get('userName');
    const uPronouns  = get('userPronouns');
    const uWho       = get('userWho');
    const uHow       = get('userHow');
    const uPrefs     = get('userPrefs');
    const uTreatment = get('userTreatment');
    const uLines     = [];
    if (uName)      uLines.push('Name: ' + uName);
    if (uPronouns)  uLines.push('Pronouns: ' + uPronouns);
    if (uWho)       uLines.push(uWho);
    if (uHow)       uLines.push('How they think/work: ' + uHow);
    if (uPrefs)     uLines.push('Preferences: ' + uPrefs);
    if (uTreatment) uLines.push('Treat them as: ' + uTreatment);
    if (uLines.length) parts.push('\nAbout the user:\n' + uLines.join('\n'));

    // ── project ─────────────────────────────────────────────────────────────
    const projGoal = get('projectGoal');
    const projInst = get('project');
    if (projGoal || projInst) {
      parts.push('\nProject:');
      if (projGoal) parts.push('Goal: ' + projGoal);
      if (projInst) parts.push(projInst);
    }

    // ── project files (injected into head, not pairs) ────────────────────────
    const pfiles = getProjectFiles();
    if (pfiles.length) {
      parts.push('\nAttached files:\n' + pfiles.map(f => '--- ' + f.name + ' ---\n' + f.content).join('\n\n'));
    }

    return parts.join('\n');
  }

  // ── project files ───────────────────────────────────────────────────────────
  let _fileError = '';

  function getProjectFiles() {
    try { return JSON.parse(get('projectFiles') || '[]'); } catch(_) { return []; }
  }

  function removeProjectFile(idx) {
    const files = getProjectFiles();
    files.splice(idx, 1);
    set('projectFiles', JSON.stringify(files));
    openDrawer();
  }

  function attachProjectFile() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = '.txt,.md,.json,.js,.py,.css,.html,.csv,.ts,.jsx,.tsx,.sh,.yaml,.toml';
    inp.onchange = () => {
      const auth   = getAuth();
      const model  = getModel();
      const ctx    = ctxForModel(auth.tier, model);
      const maxChars = Math.floor(ctx * 0.5 * 4); // 50% context window in chars
      const existing = getProjectFiles();
      let totalChars = existing.reduce((s, f) => s + f.content.length, 0);
      const toRead = Array.from(inp.files);
      const rejected = [];
      let pending = toRead.length;

      toRead.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const content = e.target.result;
          if (totalChars + content.length > maxChars) {
            rejected.push(file.name);
          } else {
            totalChars += content.length;
            existing.push({ name: file.name, content });
          }
          pending--;
          if (pending === 0) {
            set('projectFiles', JSON.stringify(existing));
            if (rejected.length) {
              const used   = Math.round(totalChars / 4);
              const budget = Math.floor(ctx / 2);
              _fileError = `"${rejected.join('", "')}" won't fit. Budget: ${budget.toLocaleString()} tokens (50% of ${ctx.toLocaleString()}), used: ${used.toLocaleString()}. Try a model with more context — Gemini 1.5 Pro (2M), Qwen3 235B (131K), or Llama 3.3 70B (131K).`;
            }
            openDrawer();
          }
        };
        reader.readAsText(file);
      });
    };
    inp.click();
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

  // ── tab state ───────────────────────────────────────────────────────────────
  let _activeTab = 'interface';

  function showTab(name) {
    _activeTab = name;
    const iface = document.getElementById('sg-panel-interface');
    const info  = document.getElementById('sg-panel-info');
    if (iface) iface.style.display = name === 'interface' ? '' : 'none';
    if (info)  info.style.display  = name === 'info'      ? '' : 'none';
    document.querySelectorAll('.sg-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === name));
  }

  // ── shared bottom controls (font + pairs + history) ─────────────────────────
  function sharedControls(sfx) {
    const fs = parseInt(get('fontSize')) || 28;
    return `
    <div class="sg-sep"></div>

    <details class="sg-tutorial" open>
      <summary class="sg-tutorial-title">ℹ️ Font size</summary>
      <div class="sg-tutorial-body">
        <p>Controls text size in the chat window. Start big — you can always go smaller. Changes take effect instantly.</p>
      </div>
    </details>
    <div class="sg-row">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <button class="sg-preset" onclick="settings.stepFontSize(-2)" style="font-size:18px;padding:2px 10px">−</button>
        <input class="sg-fontsize-input" type="number" min="8" max="64"
          value="${fs}" style="width:64px;text-align:center"
          onchange="settings.setFontSize(this.value)">
        <button class="sg-preset" onclick="settings.stepFontSize(2)" style="font-size:18px;padding:2px 10px">+</button>
        <button class="sg-preset" onclick="settings.setFontSize(8)">8</button>
        <button class="sg-preset" onclick="settings.setFontSize(12)">12</button>
        <button class="sg-preset" onclick="settings.setFontSize(16)">16</button>
        <button class="sg-preset" onclick="settings.setFontSize(28)">28</button>
      </div>
    </div>

    <details class="sg-tutorial" open>
      <summary class="sg-tutorial-title">ℹ️ Keep pairs</summary>
      <div class="sg-tutorial-body">
        <p>How many back-and-forth exchanges to remember. <strong>0 = automatic</strong> (recommended for most people). Set a number to keep a tighter window — useful when old context starts confusing the bot.</p>
      </div>
    </details>
    <div class="sg-row">
      <input type="number" min="0" placeholder="auto"
        value="${get('pairsOverride')}" onchange="settings.onField('pairsOverride',this.value)">
      <span class="sg-hint">0 = auto trim by context window</span>
    </div>

    <details class="sg-tutorial" open>
      <summary class="sg-tutorial-title">ℹ️ Clear history</summary>
      <div class="sg-tutorial-body">
        <p>Wipes the conversation memory for this skin. The bot starts fresh with no memory of what was said before. Useful for a new topic or when the bot seems confused.</p>
      </div>
    </details>
    <div class="sg-row">
      <button class="sg-btn-danger" onclick="settings.clearHistory()">Clear history</button>
    </div>`;
  }

  // ── interface panel HTML ────────────────────────────────────────────────────
  function interfaceHTML() {
    const onHF       = window.location.hostname.endsWith('.hf.space');
    const tier       = onHF ? 'hf' : (get('authTier') || 'github');
    const skin       = get('skin') || 'beach';
    const skins      = ['beach','neo','analog','historian','phone'];
    const hfModelId  = get('hfModel') || MODELS.hf[0]?.id || '';
    const modelId    = onHF ? hfModelId : getModel();
    const tierModels = onHF ? MODELS.hf : (MODELS[tier] || []);

    const authSection = onHF
      ? `<div class="sg-row">
           <label>Auth</label>
           <div class="sg-hint" style="padding:4px 0">Hugging Face free tier · no key needed</div>
         </div>`
      : `<div class="sg-row">
           <label>Auth</label>
           <select id="sg-tier" onchange="settings.onTierChange(this.value)">
             <option value="github"    ${tier==='github'   ?'selected':''}>GitHub Models (free)</option>
             <option value="anthropic" ${tier==='anthropic'?'selected':''}>BYOK — Anthropic</option>
             <option value="openai"    ${tier==='openai'   ?'selected':''}>BYOK — OpenAI</option>
             <option value="local"     ${tier==='local'    ?'selected':''}>Local (Ollama · LM Studio · MLX)</option>
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
    <div class="sg-row">
      <label>Skin</label>
      <select id="sg-skin" onchange="settings.onSkinChange(this.value)">
        ${skins.map(s => `<option value="${s}" ${s===skin?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    ${authSection}
    ${modelSection}
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
              <li>Copy it and paste into the field here</li>
            </ol>
            <p class="sg-hint">Keys are stored only in your browser. toto never sees them server-side.</p>
          </div>
        </details>

        <div class="sg-byok-providers">
          ${[
            { id:'groq',       name:'Groq',       url:'https://console.groq.com/keys',           placeholder:'gsk_...'   },
            { id:'mistral',    name:'Mistral',     url:'https://console.mistral.ai/api-keys',     placeholder:'...'       },
            { id:'cerebras',   name:'Cerebras',    url:'https://cloud.cerebras.ai',               placeholder:'csk-...'   },
            { id:'sambanova',  name:'SambaNova',   url:'https://cloud.sambanova.ai/apis',         placeholder:'...'       },
            { id:'openrouter', name:'OpenRouter',  url:'https://openrouter.ai/keys',             placeholder:'sk-or-...' },
            { id:'gemini',     name:'Gemini',      url:'https://aistudio.google.com/apikey',      placeholder:'AIza...'   },
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
    ${sharedControls('i')}`;
  }

  // ── info panel HTML ─────────────────────────────────────────────────────────
  function infoHTML() {
    return `
    <div class="sg-section-label">🤖 Bot</div>

    <details class="sg-tutorial" open>
      <summary class="sg-tutorial-title">ℹ️ How this bot acts</summary>
      <div class="sg-tutorial-body">
        <p>The bot's core personality and instructions. This is the most powerful field — it shapes everything. Leave blank for a friendly generalist. Be specific to get a specialist.</p>
        <p class="sg-hint">Example: "You are a no-nonsense editor. Be blunt. Never pad responses."</p>
      </div>
    </details>
    <div class="sg-row">
      <textarea rows="3" onchange="settings.onField('persona',this.value)"
        placeholder="You are a helpful, warm assistant.">${get('persona')}</textarea>
    </div>

    <div class="sg-row sg-row-inline">
      <div>
        <label>Bot name</label>
        <input type="text" placeholder="optional"
          value="${get('botName')}" onchange="settings.onField('botName',this.value)">
      </div>
      <div>
        <label>Pronouns</label>
        <input type="text" placeholder="they/them"
          value="${get('botPronouns')}" onchange="settings.onField('botPronouns',this.value)">
      </div>
    </div>

    <div class="sg-row">
      <label>Backstory</label>
      <textarea rows="2" onchange="settings.onField('botBackstory',this.value)"
        placeholder="Optional. Give the bot a history or context that shapes how it speaks.">${get('botBackstory')}</textarea>
    </div>

    <div class="sg-sep"></div>
    <div class="sg-section-label">🧠 Wetware node</div>

    <details class="sg-tutorial" open>
      <summary class="sg-tutorial-title">ℹ️ About you</summary>
      <div class="sg-tutorial-body">
        <p>Tell the bot who it's talking to. The more it knows about you, the better it can calibrate. All fields optional — fill in what feels useful.</p>
      </div>
    </details>

    <div class="sg-row sg-row-inline">
      <div>
        <label>Your name</label>
        <input type="text" placeholder="optional"
          value="${get('userName')}" onchange="settings.onField('userName',this.value)">
      </div>
      <div>
        <label>Pronouns</label>
        <input type="text" placeholder="they/them"
          value="${get('userPronouns')}" onchange="settings.onField('userPronouns',this.value)">
      </div>
    </div>

    <div class="sg-row">
      <label>Who I am</label>
      <textarea rows="2" onchange="settings.onField('userWho',this.value)"
        placeholder="Background, role, context. 2–3 sentences.">${get('userWho')}</textarea>
    </div>

    <div class="sg-row">
      <label>How I think / work</label>
      <textarea rows="2" onchange="settings.onField('userHow',this.value)"
        placeholder="Cognitive style, working patterns, what helps you.">${get('userHow')}</textarea>
    </div>

    <div class="sg-row">
      <label>Preferences</label>
      <textarea rows="2" onchange="settings.onField('userPrefs',this.value)"
        placeholder="Communication style, format preferences, pet peeves.">${get('userPrefs')}</textarea>
    </div>

    <div class="sg-row">
      <label>How I want to be treated</label>
      <textarea rows="2" onchange="settings.onField('userTreatment',this.value)"
        placeholder="e.g. gifted 5th grader — smart but explain jargon, no fluff.">${get('userTreatment')}</textarea>
    </div>

    <div class="sg-sep"></div>
    <div class="sg-section-label">📋 Project</div>

    <div class="sg-row">
      <label>What we're doing</label>
      <input type="text" placeholder="One line — the current mission."
        value="${get('projectGoal')}" onchange="settings.onField('projectGoal',this.value)">
    </div>

    <div class="sg-row">
      <label>Instructions</label>
      <textarea rows="3" onchange="settings.onField('project',this.value)"
        placeholder="Context, constraints, style rules, anything the bot needs to know about this work.">${get('project')}</textarea>
    </div>

    <div class="sg-row">
      <label>Project files <span class="sg-hint" style="text-transform:none;letter-spacing:0">(injected into every conversation — not in pairs)</span></label>
      ${(() => {
        const pfiles = getProjectFiles();
        const auth   = getAuth();
        const ctx    = ctxForModel(auth.tier, getModel());
        const budget = Math.floor(ctx / 2);
        const used   = Math.round(pfiles.reduce((s, f) => s + f.content.length, 0) / 4);
        const err    = _fileError; _fileError = '';
        return `
        ${err ? `<div class="sg-file-error">${err}</div>` : ''}
        ${pfiles.length ? `<div class="sg-file-list">${pfiles.map((f, i) => `
          <div class="sg-file-item">
            <span class="sg-file-name">${f.name}</span>
            <span class="sg-file-size">${Math.round(f.content.length/1024)}k</span>
            <button class="sg-file-remove" onclick="settings.removeProjectFile(${i})">✕</button>
          </div>`).join('')}
        </div>` : ''}
        <div class="sg-file-budget">
          ${used.toLocaleString()} / ${budget.toLocaleString()} tokens used (50% of ${ctx.toLocaleString()} ctx)
        </div>
        <button class="sg-preset" style="width:100%;padding:8px 0;margin-top:4px" onclick="settings.attachProjectFile()">📎 Attach project files</button>`;
      })()}
    </div>
    ${sharedControls('n')}`;
  }

  // ── drawer HTML ─────────────────────────────────────────────────────────────
  function drawerHTML() {
    return `
<div id="settings-inner">
  <div class="sg-tabs">
    <button class="sg-tab ${_activeTab==='interface'?'active':''}" data-tab="interface" onclick="settings.showTab('interface')">Interface</button>
    <button class="sg-tab ${_activeTab==='info'?'active':''}" data-tab="info" onclick="settings.showTab('info')">Info</button>
  </div>

  <div id="sg-panel-interface" style="${_activeTab==='interface'?'':'display:none'}">
    ${interfaceHTML()}
  </div>

  <div id="sg-panel-info" style="${_activeTab==='info'?'':'display:none'}">
    ${infoHTML()}
  </div>
</div>`;
  }

  function openDrawer() {
    const d = document.getElementById('settings-drawer');
    d.innerHTML =
      `<button onclick="settings.toggle()" style="position:sticky;top:0;float:right;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);border-radius:5px;padding:4px 10px;cursor:pointer;font-size:18px;margin:8px 8px 0 0;z-index:10">✕</button>` +
      drawerHTML();
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
    document.documentElement.style.setProperty('--fs-body',  val + 'px');
    document.documentElement.style.setProperty('--fs-label', Math.round(val * 0.714) + 'px');
    document.documentElement.style.setProperty('--fs-tab',   Math.round(val * 0.643) + 'px');
    document.documentElement.style.setProperty('--fs-title', Math.round(val * 1.071) + 'px');
    set('fontSize', val);
    document.querySelectorAll('.sg-fontsize-input').forEach(el => el.value = val);
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

  return { get, set, getAuth, getModel, getSystemPrompt, toggle, openDrawer, showTab, init,
           onSkinChange, onTierChange, onKeyChange, onUrlChange, onUrlPreset,
           onModelChange, onHFModelChange, onField, clearHistory, loadSkin, attachFile, discoverModels,
           setFontSize, stepFontSize,
           attachProjectFile, removeProjectFile, getProjectFiles };
})();
