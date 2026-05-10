// beach.js — dolphin / aquarium skin
(function beachMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="beach-card" class="panel p-beach">
  <div id="dolphin-header" class="ph ph-row1">
    <span style="font-size:24px;line-height:1">🐚</span>
    <span class="ph-title" style="color:#0a3a5a">toto</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="beach-jsr"></div>
      <div class="coder-jewel cj-a" id="beach-jsa"></div>
      <div class="coder-jewel cj-g" id="beach-jsg"></div>
    </div>
    <button class="bot-stop" id="beach-stop" style="display:none">⏹</button>
  </div>
  <div class="pb">
    <div id="beach-msgs" class="skin-out"></div>
    <div id="beach-wave">
      <svg width="100%" height="100%" viewBox="0 0 400 28" preserveAspectRatio="none">
        <rect x="0" y="14" width="400" height="14" fill="#0f2e48"/>
        <path d="M0 14 Q30 4 60 14 Q90 24 120 12 Q150 2 180 12 Q210 22 240 10 Q270 0 300 12 Q330 22 360 10 Q385 2 400 10 L400 28 L0 28 Z" fill="#1e6090"/>
        <path d="M0 14 Q30 4 60 14 Q90 24 120 12 Q150 2 180 12 Q210 22 240 10 Q270 0 300 12 Q330 22 360 10 Q385 2 400 10" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>
    <div id="beach-floor" class="skin-kbd" onclick="event.stopPropagation()">
      <div id="beach-ball-toggle" title="open keyboard">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" fill="white"/>
          <path d="M22 22 L22 2 A20 20 0 0 1 36.14 7.86 Z" fill="#C8A8E8"/>
          <path d="M22 22 L36.14 7.86 A20 20 0 0 1 42 22 Z" fill="white"/>
          <path d="M22 22 L42 22 A20 20 0 0 1 36.14 36.14 Z" fill="#C8A8E8"/>
          <path d="M22 22 L36.14 36.14 A20 20 0 0 1 22 42 Z" fill="white"/>
          <path d="M22 22 L22 42 A20 20 0 0 1 7.86 36.14 Z" fill="#C8A8E8"/>
          <path d="M22 22 L7.86 36.14 A20 20 0 0 1 2 22 Z" fill="white"/>
          <path d="M22 22 L2 22 A20 20 0 0 1 7.86 7.86 Z" fill="#C8A8E8"/>
          <path d="M22 22 L7.86 7.86 A20 20 0 0 1 22 2 Z" fill="white"/>
          <circle cx="22" cy="22" r="20" stroke="rgba(150,100,200,0.2)" stroke-width="1"/>
        </svg>
      </div>
      <div id="beach-input-wrap" style="display:none">
        <textarea id="beach-input" class="bot-input" placeholder="…" spellcheck="false"></textarea>
        <button id="beach-send" class="bot-send">send</button>
      </div>
    </div>
  </div>
</div>`;

  toto.mountResize({ sliderId: 'beach-wave', topId: 'beach-msgs', minTop: 60, minBottom: 60 });
  toto.mountToggle({ toggleId: 'beach-ball-toggle', inputWrapId: 'beach-input-wrap', focusId: 'beach-input' });

  toto.mount({
    skinId:  'beach',
    cardId:  'beach-card',
    msgsId:  'beach-msgs',
    inputId: 'beach-input',
    sendId:  'beach-send',
    stopId:  'beach-stop',
  });

})();
