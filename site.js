/* =====================================================================
   East Side Story のHP（試作）：全ページ共通の動き
   1. 上のバー・下の帯（フッター）・スマホの LINE ボタンを差し込む（ページごとに書かない）
   2. 生地の帯の斜めの縫い目とステッチを置く
   3. データ（data.js）を並べるための小さな道具（ESS.h など）
   メニューの言葉・並びを変える時は、下の NAV と FOOTER を直す。
   ===================================================================== */
(function(){
  var ESS = window.ESS = window.ESS || {};
  var page = location.pathname.split('/').pop() || 'nuitsuke.html';
  var TOP = 'nuitsuke.html';  // トップのページ

  /* ===== メニュー（上のバー。5つまで。最後の LINE はボタンで出す） ===== */
  var NAV = [
    ['how.html',    'しくみ・料金'],
    ['works.html',  '作品'],
    ['makers.html', 'つくり手'],
    ['faq.html',    'よくある質問'],
    ['original.html','自社商品']
  ];
  /* ===== 下の帯（全部のページへのリンク） ===== */
  var FOOTER = [
    ['リメイク', [[TOP,'トップ'],['how.html','しくみ・料金'],['works.html','作品'],['makers.html','つくり手'],['faq.html','よくある質問']]],
    ['ブランド', [['about.html','ブランドについて'],['original.html','自社商品（ORIGINAL）'],['news.html','イベント・お知らせ']]],
    ['お問い合わせ', [['LINE','LINEで相談'],['trade.html','お店・お取引の方へ'],['#instagram','Instagram［仮］'],['#tiktok','TikTok［仮］'],['#youtube','YouTube［仮］']]],
    ['決まりごと', [['privacy.html','プライバシーポリシー'],['tokushoho.html','特定商取引法の表記']]]
  ];

  /* ===== 小さな道具 ===== */
  // 文字をそのまま HTML に入れても壊れないようにする
  ESS.h = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  // ［仮］を目立たない色にする
  ESS.t = function(s){ return ESS.h(s).replace(/［仮］/g, '<span class="tmp">［仮］</span>'); };
  // LINE のボタン（ラベルを変えられる）
  ESS.lineBtn = function(label){
    var s = ESS.site || {};
    return '<a class="btn btn-line" href="' + ESS.h(s.lineUrl || '#line') + '">' + ESS.h(label || 'LINEで相談する') + '</a>';
  };
  ESS.lineNote = function(){ return '<span class="btn-note">' + ESS.h((ESS.site || {}).lineNote || '') + '</span>'; };
  ESS.param = function(name){ var m = location.search.match(new RegExp('[?&]' + name + '=([^&]+)')); return m ? decodeURIComponent(m[1]) : ''; };
  ESS.find = function(list, key, val){ for (var i = 0; i < (list || []).length; i++) if (list[i][key] === val) return list[i]; return null; };
  // 作品のカード（一覧・トップ・つくり手のページで使う）
  ESS.workCard = function(w){
    var m = ESS.find(ESS.makers, 'id', w.maker);
    return '<a class="card" href="work.html?no=' + ESS.h(w.no) + '">' +
      '<div class="photo after">' + (w.after ? '<img src="img/' + ESS.h(w.after) + '" alt="">' : 'No.' + ESS.h(w.no) + ' アフターの写真') + '</div>' +
      '<p class="card-title"><span class="en">No.' + ESS.h(w.no) + '</span>　' + ESS.t(w.title) + '</p>' +
      '<p class="card-meta">' + ESS.h(w.material) + '／' + ESS.t(m ? m.name : '') + '</p></a>';
  };
  // つくり手のカード
  ESS.makerCard = function(m){
    return '<a class="card" href="maker.html?id=' + ESS.h(m.id) + '">' +
      '<div class="photo square">' + (m.photo ? '<img src="img/' + ESS.h(m.photo) + '" alt="">' : 'つくり手の写真') + '</div>' +
      '<p class="card-title">' + ESS.t(m.name) + '</p>' +
      '<p class="card-meta">得意：' + ESS.h(m.skills.join('・')) + '</p>' +
      '<p class="status' + (m.open ? ' open' : '') + '">' + (m.open ? '今受けられます' : ESS.t(m.next || '受付は休み')) + '</p></a>';
  };

  var lineHref = function(){ return ESS.h((ESS.site || {}).lineUrl || '#line'); };
  var link = function(href, label){
    if (href === 'LINE') href = (ESS.site || {}).lineUrl || '#line';
    return '<a href="' + ESS.h(href) + '"' + (href === page ? ' aria-current="page"' : '') + '>' + ESS.h(label) + '</a>';
  };

  /* ===== 1. 上のバー（トップは自分のバーを持っているので差し込まない） ===== */
  if (!document.querySelector('.bar')) {
    // ロゴのモノグラムを生成りの糸の刺繍に見せるフィルター
    var defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      '<filter id="th-cream" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">' +
      '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 .93  0 0 0 0 .88  0 0 0 0 .78  -1.2 -1.2 -1.2 3.3 0" result="ink"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.4 .22" numOctaves="1" seed="3" result="t"/>' +
      '<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .7 -.2" result="ts"/>' +
      '<feComposite in="ts" in2="ink" operator="in" result="tex"/>' +
      '<feMerge result="emb"><feMergeNode in="ink"/><feMergeNode in="tex"/></feMerge>' +
      '<feDropShadow in="emb" dx="0" dy="1.2" stdDeviation=".7" flood-color="#000" flood-opacity=".6"/></filter></defs></svg>';
    var bar = '<header class="bar" data-injected>' +
      '<a href="' + TOP + '" class="bar-logo" aria-label="East Side Story トップへ"><span class="bar-mono" aria-hidden="true"></span><span class="bar-name">East Side Story</span></a>' +
      '<button type="button" class="menu-btn" aria-expanded="false" aria-controls="bar-nav">メニュー</button>' +
      '<nav id="bar-nav" aria-label="メニュー">' + NAV.map(function(n){ return link(n[0], n[1]); }).join('') + '</nav>' +
      '<a class="btn btn-line" href="' + lineHref() + '">LINEで相談</a></header>';
    document.body.insertAdjacentHTML('afterbegin', defs + bar);
    var btn = document.querySelector('.bar .menu-btn');
    btn.addEventListener('click', function(){
      var n = document.getElementById('bar-nav'), o = n.classList.toggle('open');
      btn.setAttribute('aria-expanded', o); btn.textContent = o ? '閉じる' : 'メニュー';
    });
  }

  /* ===== 2. 下の帯（フッター） ===== */
  var foot = '<footer class="site-footer" data-injected><div class="inner">' +
    FOOTER.map(function(col){
      return '<div><h2>' + ESS.h(col[0]) + '</h2><ul>' + col[1].map(function(l){ return '<li>' + link(l[0], l[1]) + '</li>'; }).join('') + '</ul></div>';
    }).join('') +
    '</div><p class="copy inner">© East Side Story — YOKOHAMA</p></footer>';
  document.body.insertAdjacentHTML('beforeend', foot);

  /* ===== 3. スマホの画面の下の LINE ボタン（どのページからも1回で LINE へ） ===== */
  if (!document.querySelector('.line-dock')) {
    document.body.insertAdjacentHTML('beforeend', '<div class="line-dock" data-injected><a class="line-dock-btn" href="' + lineHref() + '">LINEで相談する</a></div>');
  }

  /* ===== 3-2. 店の基本の値と LINE のボタンを埋める =====
     <span data-site="price"></span> → data.js の ESS.site.price の中身が入る
     <div data-line></div> → LINE のボタンと、押す前の不安を消す一言が入る */
  document.querySelectorAll('[data-site]').forEach(function(el){
    el.innerHTML = ESS.t((ESS.site || {})[el.getAttribute('data-site')]);
  });
  document.querySelectorAll('[data-line]').forEach(function(el){
    el.innerHTML = ESS.lineBtn(el.getAttribute('data-line') || '') + ESS.lineNote();
  });

  /* ===== 4. 生地の帯の斜めの縫い目（トップは自分で置くので、data-own-seams の時は置かない） ===== */
  if (!document.body.hasAttribute('data-own-seams')) {
    document.querySelectorAll('[data-seam]').forEach(function(b){
      var big = 90 + Math.random() * 60, small = Math.random() * 30, leftHigh = Math.random() < .5;
      var tl = leftHigh ? small : big, tr = leftHigh ? big : small;
      b.style.setProperty('--tl', tl + 'px'); b.style.setProperty('--tr', tr + 'px');
      var s = document.createElement('span'); s.className = 'stitch'; s.setAttribute('aria-hidden', 'true');
      s.dataset.tl = tl; s.dataset.tr = tr; b.appendChild(s);
    });
    var place = function(){
      document.querySelectorAll('.band > .stitch').forEach(function(s){
        var w = s.parentNode.offsetWidth, tl = +s.dataset.tl, tr = +s.dataset.tr;
        s.style.top = (tl + 14) + 'px';
        s.style.width = Math.hypot(w, tr - tl) + 'px';
        s.style.transform = 'translateY(-50%) rotate(' + Math.atan2(tr - tl, w) + 'rad)';
      });
    };
    place(); addEventListener('resize', place);
  }
})();
