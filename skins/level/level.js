// level.js — spirit level / bub skin
(function levelMount() {
  const mount = document.getElementById('skin-mount');
  if (!mount) return;

  mount.innerHTML = `
<div id="level-card" class="p-level">
  <div class="ph ph-row1">
    <div class="lv-icon oz-model-icon"></div>
    <span class="ph-title" style="font-family:'Caveat',cursive;color:#6a3808">bub</span>
    <div class="coder-jewels">
      <div class="coder-jewel cj-r" id="level-jsr"></div>
      <div class="coder-jewel cj-a" id="level-jsa"></div>
      <div class="coder-jewel cj-g" id="level-jsg"></div>
    </div>
    <button class="bot-stop" id="level-stop" style="display:none">⏹</button>
  </div>
  <div class="lv-body">
    <div class="lv-out" id="lv-out"></div>
    <div class="lv-resize-h"></div>
    <div class="lv-floor" onclick="event.stopPropagation()">
      <textarea id="lv-input" class="lv-input" placeholder="bub." spellcheck="false"></textarea>
      <button id="lv-send" class="lv-send">send</button>
    </div>
    <div class="lv-plank"></div>
  </div>
</div>`;

  toto.mount({
    skinId:  'level',
    cardId:  'level-card',
    msgsId:  'lv-out',
    inputId: 'lv-input',
    sendId:  'lv-send',
    stopId:  'level-stop',
  });
})();
