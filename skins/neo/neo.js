// neo.js — CRT terminal skin
(function neoMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="neo-card" class="p-neo">
  <div class="ph ph-row1">
    <svg class="oz-model-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="0.5" y="0.5" width="27" height="19" rx="2.5" fill="#C4BC9C" stroke="#9A9280" stroke-width="0.8"/>
      <rect x="0.5" y="0.5" width="27" height="4" rx="2.5" fill="rgba(255,255,255,0.18)"/>
      <rect x="3" y="3" width="22" height="14" rx="1.5" fill="#060D04"/>
      <line x1="5" y1="7" x2="12" y2="7" stroke="#00CC44" stroke-width="0.9" stroke-linecap="round"/>
      <line x1="5" y1="10" x2="18" y2="10" stroke="#00CC44" stroke-width="0.9" stroke-linecap="round" opacity="0.6"/>
      <line x1="5" y1="13" x2="14" y2="13" stroke="#00CC44" stroke-width="0.9" stroke-linecap="round" opacity="0.4"/>
      <rect x="12" y="6" width="2.5" height="2" rx="0.3" fill="#00EE55"/>
      <circle cx="25.5" cy="17.5" r="1.1" fill="#00CC44" opacity="0.7"/>
      <circle cx="22.5" cy="17.5" r="1.1" fill="#FF9900" opacity="0.4"/>
      <rect x="11" y="19" width="6" height="3.5" rx="0.5" fill="#ACA898"/>
      <rect x="6" y="22.5" width="16" height="3" rx="1.5" fill="#B8B0A0" stroke="#9A9288" stroke-width="0.5"/>
    </svg>
    <span class="ph-title" style="color:#062018;letter-spacing:2px">neo</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="neo-jsr"></div>
      <div class="coder-jewel cj-a" id="neo-jsa"></div>
      <div class="coder-jewel cj-g" id="neo-jsg"></div>
    </div>
    <button class="bot-stop" id="neo-stop" style="display:none">⏹</button>
  </div>
  <div class="neo-pb">
    <div class="neo-out" id="neo-out"></div>
    <div class="panel-resize-h" id="neo-resize" title="drag to resize"></div>
    <div class="neo-kbd-bar" id="neo-kbd">
      <div class="neo-kbd-inner">
        <div class="neo-kbd-toggle" id="neo-kbd-toggle" title="keyboard">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" stroke-width="1.8"/>
            <line x1="6" y1="10.5" x2="6" y2="10.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="10" y1="10.5" x2="10" y2="10.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="14" y1="10.5" x2="14" y2="10.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="18" y1="10.5" x2="18" y2="10.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="7" y1="14.5" x2="17" y2="14.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="neo-kbd-input-wrap" id="neo-kbd-input-wrap" style="display:none" onclick="event.stopPropagation()">
          <textarea id="neo-input" class="bot-input neo-input" rows="1" placeholder="> type here..."></textarea>
          <button id="neo-send" class="bot-send neo-send">send</button>
        </div>
      </div>
    </div>
  </div>
</div>`;

  toto.mountResize({ sliderId: 'neo-resize', topId: 'neo-out', minTop: 60, minBottom: 56 });
  toto.mountToggle({ toggleId: 'neo-kbd-toggle', inputWrapId: 'neo-kbd-input-wrap', focusId: 'neo-input' });

  toto.mount({
    skinId:  'neo',
    cardId:  'neo-card',
    msgsId:  'neo-out',
    inputId: 'neo-input',
    sendId:  'neo-send',
    stopId:  'neo-stop',
  });
})();
