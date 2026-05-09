// analog.js — IBM mainframe / printer skin
(function analogMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  // build 9 vacuum tubes
  const tubeHTML = Array.from({length:9}, (_,i) =>
    `<div class="ctube" id="analog-ct${i}">
      <div class="ct-glass"><div class="ct-glow"></div></div>
      <div class="ct-base"></div>
      <div class="ct-pins"><div class="ct-pin"></div><div class="ct-pin"></div><div class="ct-pin"></div></div>
    </div>`
  ).join('');

  mount.innerHTML = `
<div id="analog-card" class="p-analog">
  <div class="ph ph-row1" id="analog-ph">
    <svg class="oz-model-icon" viewBox="0 0 24 28" width="24" height="28" fill="none">
      <line x1="12" y1="0" x2="12" y2="4" stroke="#8A9A80" stroke-width="1.5"/>
      <circle cx="12" cy="1.5" r="1.5" fill="#8A9A80"/>
      <rect x="5" y="4" width="14" height="10" rx="2" fill="#6A7A60" stroke="#8A9A80" stroke-width="0.8"/>
      <rect x="7" y="7" width="3" height="2" rx="1" fill="#FF9900" opacity="0.9"/>
      <rect x="14" y="7" width="3" height="2" rx="1" fill="#FF9900" opacity="0.9"/>
      <line x1="8" y1="11.5" x2="16" y2="11.5" stroke="#8A9A80" stroke-width="0.6"/>
      <rect x="10" y="14" width="4" height="2" fill="#5A6A50"/>
      <rect x="3" y="16" width="18" height="11" rx="2" fill="#5A6A50" stroke="#7A8A70" stroke-width="0.8"/>
      <rect x="7" y="18" width="10" height="6" rx="1" fill="#3A4A30" stroke="#6A7A60" stroke-width="0.5"/>
      <circle cx="9" cy="21" r="1" fill="#00CC44" opacity="0.8"/>
      <circle cx="12" cy="21" r="1" fill="#FF9900" opacity="0.6"/>
      <circle cx="15" cy="21" r="1" fill="#CC2200" opacity="0.5"/>
    </svg>
    <span class="ph-title analog-title">analog</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="analog-jsr"></div>
      <div class="coder-jewel cj-a" id="analog-jsa"></div>
      <div class="coder-jewel cj-g" id="analog-jsg"></div>
    </div>
    <button class="bot-stop" id="analog-stop" style="display:none">⏹</button>
  </div>

  <div class="analog-body">

  <!-- spool fade teeth -->
  <div class="analog-teeth"></div>

  <!-- green-bar printer output -->
  <div class="analog-printer" id="analog-msgs"></div>

  <!-- vacuum tube row — drag to resize -->
  <div class="analog-tubes" id="analog-tubes" title="drag to resize">
    <span class="analog-resize-arr">↕</span>
    ${tubeHTML}
    <span class="analog-resize-arr">↕</span>
  </div>

  <!-- dock: [stack] [slot INPUT] [center] [slot OUTPUT] [stack] -->
  <div class="analog-dock" id="analog-dock">

    <!-- left stack — click to open input -->
    <div class="analog-dock-left" id="analog-dock-left" title="open keyboard">
      <div class="analog-stack">
        <div class="astack-card"></div>
        <div class="astack-card"></div>
        <div class="astack-card"></div>
      </div>
    </div>

    <!-- inner zone -->
    <div class="analog-dock-inner">

      <!-- INPUT slot -->
      <div class="analog-dock-slot analog-slot-left">
        <div class="acard-slot">
          <div class="acard-slot-lip"></div>
          <div class="acard-slot-opening"></div>
          <div class="acard-slot-lip"></div>
        </div>
        <span class="aslot-label">INPUT</span>
      </div>

      <!-- center: porthole + speaker + porthole -->
      <div class="analog-dock-center" id="analog-dock-center">
        <div class="analog-porthole">
          <svg viewBox="0 0 80 80"><path class="aosc-trace" d="M0,40 Q20,20 40,40 Q60,60 80,40"/></svg>
          <span class="aosc-lbl">T/s</span>
        </div>
        <div class="analog-speaker">
          <div class="analog-grille"><div class="analog-speaker-center"></div></div>
        </div>
        <div class="analog-porthole">
          <svg viewBox="0 0 80 80"><path class="aosc-trace" d="M0,40 Q20,55 40,40 Q60,25 80,40"/></svg>
          <span class="aosc-lbl">LOAD</span>
        </div>
      </div>

      <!-- OUTPUT slot -->
      <div class="analog-dock-slot analog-slot-right">
        <div class="acard-slot">
          <div class="acard-slot-lip"></div>
          <div class="acard-slot-opening"></div>
          <div class="acard-slot-lip"></div>
        </div>
        <span class="aslot-label">OUTPUT</span>
      </div>

      <!-- input overlay — covers inner zone when open -->
      <div class="analog-input-wrap" id="analog-input-wrap" onclick="event.stopPropagation()">
        <textarea id="analog-input" class="bot-input analog-input" placeholder="submit job…"></textarea>
        <button id="analog-send" class="bot-send analog-send">RUN</button>
      </div>

    </div><!-- /inner -->

    <!-- right stack -->
    <div class="analog-dock-right">
      <div class="analog-stack">
        <div class="astack-card"></div>
        <div class="astack-card"></div>
      </div>
    </div>

  </div><!-- /analog-dock -->

  </div><!-- /analog-body -->
</div>`;

  toto.mountResize({ sliderId: 'analog-tubes', topId: 'analog-msgs', minTop: 80, minBottom: 80 });

  // toggle: left stack opens input wrap + dock class for CSS hide of center/slots
  const dockLeft  = document.getElementById('analog-dock-left');
  const dock      = document.getElementById('analog-dock');
  const inputWrap = document.getElementById('analog-input-wrap');
  const inputEl   = document.getElementById('analog-input');
  if (dockLeft && dock && inputWrap) {
    dockLeft.addEventListener('click', () => {
      const isOpen = dock.classList.contains('open');
      dock.classList.toggle('open', !isOpen);
      inputWrap.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen && inputEl) inputEl.focus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dock.classList.contains('open')) {
        dock.classList.remove('open');
        inputWrap.style.display = 'none';
      }
    });
  }

  toto.mount({
    skinId:  'analog',
    cardId:  'analog-card',
    msgsId:  'analog-msgs',
    inputId: 'analog-input',
    sendId:  'analog-send',
    stopId:  'analog-stop',
  });
})();
