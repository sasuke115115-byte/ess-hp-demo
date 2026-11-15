/* =====================================================================
   East Side Story：方位磁石の演出（compass.css と組で使う）
   1. 盤の目盛りと文字が、E から時計回りに1つずつフェードインする（SWEEP_MS・--fade-ms）
   2. 針だけが、くるくる回りながら揺れる
   3. 磁石に引かれて行き過ぎ・戻りを繰り返し、E（EAST）で止まる。
      揺れ始めたらブランド名が左から1文字ずつ出て、止まると E が金に灯る
   針の動きは本物の方位磁石の動き（回す勢い・磁石の引く強さ・止まりやすさ）を計算して出している。
   playCompass() でもう一度最初から動く。
   ===================================================================== */
(function(){
  /* ===== 針の動きの調整 =====
    spin     ：最初の回す勢い（大きいほど多く回る。18 でおよそ2.6回転、全部で約4秒）
    pull     ：磁石が E に引く強さ（大きいほど揺れが速い）
    slipSpin ：回っている間の止まりにくさ（小さいほど長く回る）
    slipSettle：E のまわりで揺れ始めてからの止まりやすさ（大きいほど早く落ち着く）
    startDeg ：針の最初の向き（度。0＝北）
    delayMs  ：盤のフェードインが始まってから、針が回り始めるまで（盤が一周出そろう頃） */
  var NEEDLE = { spin:18, pull:42, slipSpin:.8, slipSettle:4.5, startDeg:-30, delayMs:1700 };
  var TARGET = Math.PI / 2; // E（東）
  var SWEEP_MS = 1400;  // 盤の目盛り・文字が E から時計回りに一周出そろうまでの時間
  var LETTER_TURN = 90; // 文字の回し方（度。時計回り。0 で回さない、-90 で反対向き）
  var hero = document.getElementById('compass-hero');
  if (!hero) return;
  var SUB = hero.dataset.sub || 'ORIGINAL';  // ブランド名の下の小さな文字

  /* ===== 盤と針（円の線は引かない。2026-11-15 あなたのスケッチ）。
     針は細い三角を2つ合わせた形で、金の先が指す向き。先は文字の手前まで ===== */
  hero.setAttribute('aria-label', 'East Side Story');
  hero.innerHTML =
    '<div class="compass-stage">' +
    '<svg class="compass" viewBox="-220 -220 440 440" role="img" aria-label="方位磁石の針が東を指して止まる">' +
      '<defs>' +
        '<radialGradient id="east-glow-grad"><stop offset="0" stop-color="#C9A86E" stop-opacity=".35"/><stop offset="1" stop-color="#C9A86E" stop-opacity="0"/></radialGradient>' +
        '<filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="2" dy="3" stdDeviation="2.2" flood-color="#000" flood-opacity=".22"/></filter>' +
      '</defs>' +
      '<g class="compass-dial">' +
        '<circle class="compass-east-glow" cx="168" cy="0" r="40" fill="url(#east-glow-grad)"/>' +
        '<g id="compass-ticks" stroke="currentColor" stroke-linecap="round"></g>' +
        '<text class="compass-letter" x="0" y="-168" text-anchor="middle" dominant-baseline="central" font-size="40">N</text>' +
        '<text class="compass-letter east" x="168" y="0" text-anchor="middle" dominant-baseline="central" font-size="40">E</text>' +
        '<text class="compass-letter" x="0" y="168" text-anchor="middle" dominant-baseline="central" font-size="40">S</text>' +
        '<text class="compass-letter" x="-168" y="0" text-anchor="middle" dominant-baseline="central" font-size="40">W</text>' +
      '</g>' +
      '<g class="compass-needle" filter="url(#needle-shadow)"><g id="needle-rot">' +
        '<path d="M0 -146 L4.5 0 L-4.5 0 Z" fill="var(--color-gold)"/>' +
        '<path d="M0 -146 L4.5 0 L0 0 Z" fill="#000" opacity=".14"/>' +
        '<path d="M0 124 L4.5 0 L-4.5 0 Z" fill="var(--color-ink)"/>' +
        '<circle r="2.6" fill="var(--color-ink)"/>' +
      '</g></g>' +
    '</svg></div>' +
    '<p class="compass-title"><span class="en">EAST SIDE STORY</span><span class="sub">' + SUB + '</span></p>';

  // 目盛り：文字（N・E・S・W）の間に3本ずつ、22.5度ごと。45度の所だけ少し長く
  var g = document.getElementById('compass-ticks'), html = '';
  for (var d = 22.5; d < 360; d += 22.5) {
    if (d % 90 === 0) continue; // 文字の所には引かない
    var mid = d % 45 === 0, r1 = mid ? 150 : 156, r2 = 182;
    var a = d * Math.PI / 180, s = Math.sin(a), c = -Math.cos(a);
    html += '<line x1="' + (s*r1).toFixed(1) + '" y1="' + (c*r1).toFixed(1) + '" x2="' + (s*r2).toFixed(1) + '" y2="' + (c*r2).toFixed(1) +
      '" stroke-width="' + (mid ? 2 : 1.4) + '"/>';
  }
  g.innerHTML = html;
  // 文字を90度回す
  hero.querySelectorAll('.compass-letter').forEach(function(t){
    t.setAttribute('transform', 'rotate(' + LETTER_TURN + ' ' + t.getAttribute('x') + ' ' + t.getAttribute('y') + ')');
  });
  // 目盛りと文字に、E から時計回りの順で出る遅れを付ける
  hero.querySelectorAll('#compass-ticks line, .compass-letter').forEach(function(el){
    var x = +(el.getAttribute('x') || (+el.getAttribute('x1') + +el.getAttribute('x2')) / 2);
    var y = +(el.getAttribute('y') || (+el.getAttribute('y1') + +el.getAttribute('y2')) / 2);
    var bearing = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;  // 0＝N、90＝E
    var fromE = (bearing - 90 + 360) % 360;
    el.classList.add('dial-item');
    el.style.setProperty('--d', Math.round(fromE / 360 * SWEEP_MS) + 'ms');
  });
  // ブランド名を1文字ずつに分け、左から順に出る遅れを付ける（読み上げは元の文のまま）
  var en = hero.querySelector('.compass-title .en'), text = en.textContent;
  en.setAttribute('aria-label', text);
  en.innerHTML = text.split('').map(function(ch, i){
    return '<span class="ch" aria-hidden="true" style="--i:' + i + '">' + ch + '</span>';
  }).join('');

  // 針の動きを先に計算しておく（毎回同じ動きになり、必ず E で止まる）
  function simulate(){
    var dt = 1/240, th = NEEDLE.startDeg * Math.PI/180, w = NEEDLE.spin, c = NEEDLE.slipSpin, out = [th], captured = false;
    for (var i = 0; i < 240*12; i++) {
      var dd = Math.atan2(Math.sin(th - TARGET), Math.cos(th - TARGET)); // E からのずれ（-π〜π）
      var acc = -NEEDLE.pull * Math.sin(dd) - c * w;
      w += acc * dt; th += w * dt;
      if (!captured && w < 0) { captured = true; c = NEEDLE.slipSettle; out.swayAt = out.length; } // 初めて押し戻されたら、揺れて落ち着く段に入る（ここで文字を出す）
      out.push(th);
      if (captured && Math.abs(dd) < .004 && Math.abs(w) < .05) break; // 目に見えないほど小さくなったら止める
    }
    // 最後は E にぴったり合わせる
    var last = out[out.length-1], e = Math.atan2(Math.sin(last - TARGET), Math.cos(last - TARGET));
    out.push(last - e);
    return out;
  }

  // 試作の見比べ用：?flat=1 で傾けない盤
  if (/flat=1/.test(location.search)) document.body.classList.add('is-flat');
  var rot = document.getElementById('needle-rot'), timer, raf;
  function setNeedle(rad){ rot.setAttribute('transform', 'rotate(' + (rad*180/Math.PI).toFixed(2) + ')'); }
  var STATES = ['no-anim', 'is-shown', 'is-spinning', 'is-swaying', 'is-settled'];

  window.playCompass = function(){
    clearTimeout(timer); cancelAnimationFrame(raf);
    STATES.forEach(function(s){ hero.classList.remove(s); });
    hero.classList.add('no-anim');
    void hero.offsetWidth;            // 一度消し切ってから
    hero.classList.remove('no-anim'); // また時計回りに出す
    var path = simulate();
    setNeedle(path[0]);
    // 動きを減らす設定の人には、回さずに E を指した形で見せる
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setNeedle(TARGET); hero.classList.add('is-shown', 'is-settled'); return;
    }
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ hero.classList.add('is-shown'); }); });
    timer = setTimeout(function(){
      hero.classList.add('is-shown', 'is-spinning');  // 盤が出ていなければ、ここで必ず出す（画面の描き直しが遅れた時の保険）
      var t0 = performance.now();
      (function step(now){
        var i = Math.min(path.length - 1, Math.floor((now - t0) / 1000 * 240));
        setNeedle(path[i]);
        if (i >= path.swayAt) hero.classList.add('is-swaying');
        if (i < path.length - 1) raf = requestAnimationFrame(step);
        else { hero.classList.remove('is-spinning'); hero.classList.add('is-settled'); }
      })(t0);
    }, NEEDLE.delayMs);
  };
  window.playCompass();

  // 背景に残す（data-backdrop がある時）：止まった後、少しでも下へ読み進めたら薄くして背景にする。いちばん上に戻ると元の濃さ
  if (hero.hasAttribute('data-backdrop')) {
    var checkBackdrop = function(){
      hero.classList.toggle('is-backdrop', hero.classList.contains('is-settled') && window.scrollY > 40);
    };
    addEventListener('scroll', checkBackdrop, { passive: true });
    new MutationObserver(checkBackdrop).observe(hero, { attributes: true, attributeFilter: ['class'] });
  }
})();
