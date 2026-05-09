// historian.js — book / archive skin
(function historianMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="hist-card" class="p-hist">
  <div class="ph ph-row1">
    <span class="oz-model-icon" style="font-size:22px;line-height:1;display:flex;align-items:center">📜</span>
    <span class="ph-title" style="font-family:'Georgia',serif;color:#c8b890">historian</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="historian-jsr"></div>
      <div class="coder-jewel cj-a" id="historian-jsa"></div>
      <div class="coder-jewel cj-g" id="historian-jsg"></div>
    </div>
    <button class="bot-stop" id="historian-stop" style="display:none">⏹</button>
  </div>
  <div class="hist-book-wrap" id="hist-book-wrap">
    <img class="hist-top-img" src="skins/historian/historian-top.png" alt="">
    <div id="hist-msgs" class="hist-msgs"></div>
  </div>
  <div class="hist-slider" id="hist-slider">
    <img class="hist-slider-img" src="skins/historian/historian-slider.png" alt="" draggable="false">
  </div>
  <div class="hist-buttons-wrap">
    <img class="hist-buttons-img" src="skins/historian/historian-buttons-off.png" alt="">
    <div class="hbw-talk" id="hbw-talk" title="talk"></div>
    <div class="hbw-send" id="hist-send" title="send"></div>
    <div class="hist-bottom" id="hist-bottom" style="display:none">
      <textarea id="hist-input" class="hist-textarea" placeholder="ask the historian..."></textarea>
    </div>
  </div>
</div>`;

  // slider resize
  toto.mountResize({ sliderId: 'hist-slider', topId: 'hist-book-wrap', minTop: 60, minBottom: 120 });

  toto.mountToggle({ toggleId: 'hbw-talk', inputWrapId: 'hist-bottom', focusId: 'hist-input', displayValue: 'block' });

  toto.mount({
    skinId:  'historian',
    cardId:  'hist-card',
    msgsId:  'hist-msgs',
    inputId: 'hist-input',
    sendId:  'hist-send',
    stopId:  'historian-stop',
  });
})();
