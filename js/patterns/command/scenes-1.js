/*
 * Command — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const CM = DP.cmd;
  const { h } = DP;
  const kit = DP.kit;
  const esc = DP.esc;
  const md = (t) => DP.md(t, CM.roleOf);
  CM.md = md;
  CM.scenes = CM.scenes || {};
  const ui = (CM.ui = {
    foot: (root) => kit.foot(root, CM.roleOf),
    roleChip: (key) => kit.roleChip(CM.roles, key),
  });

  /** Konsol: satırlar {t, k, bad, ok, note, hl}; alıcı satırları içeriden, hata satırları kırmızı. */
  CM.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line', 'cmdl-' + (l.k || 'x')];
      if (l.bad) cls.push('is-badline');
      if (l.k === 'err') cls.push('is-err');
      if (l.k === 'durum') cls.push('is-strong');
      if (l.hl) cls.push('is-hlline');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const row = h('div', { class: cls.join(' ') }, l.t);
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };
  /** Çalıştırma satırı → konsol satırı ("geri alınacak işlem yok" boşa giden geri al ise kırmızı) */
  CM.consoleLine = (l, o) => {
    o = o || {};
    if (l.k === 'yok' && o.yokBad) return { t: l.t, k: l.k, bad: true, note: o.yokNote || null };
    if (l.k === 'err' && l.t.startsWith('Exception')) return { t: l.t, k: l.k, note: o.errNote || null };
    return { t: l.t, k: l.k, hl: o.hl ? o.hl(l) : false };
  };
  CM.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Programın son hâli → sahne durumu (Sorun, Çözüm adımları, Tezgâh) */
  CM.sonDurum = function (prog, o) {
    o = o || {};
    const r = o.run || CM.run(prog);
    const s = r.son;
    const st = CM.stateFrom(prog, s, { banner: o.banner || null, hl: o.hl || {}, ghost: o.ghost || {} });
    if (prog.gece) st.bant = CM.geceBant(prog, s);
    else if (prog.design === 'komut') {
      const kartlar = (s.gecmis || []).concat(s.ileri || []);
      st.bant = kartlar.length ? { kind: 'kartlar', kartlar: kartlar.slice(-3).map((k, i) => ({ kart: k, ad: 'k' + (i + 1) })) } : null;
    }
    return st;
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: düğme → komut kartı → raf; kart geçmişe girer, "geri al" kartı geri çıkarır */
  const HRAF = (raf) => {
    const r = 'ABC'.indexOf(raf[0]);
    const c = Number(raf.slice(1)) - 1;
    return { x: 236 + c * 58, y: 118 + r * 52 };
  };
  const HKAMYON = { x: 486, y: 170 };
  const HPLAN = [
    { d: 'tasi', yer: { 1001: 'A1', 1003: 'A3' }, yigin: [], ucan: null, not: 'Operatör “Taşı”ya bastı' },
    { d: 'tasi', yer: { 1001: 'A1', 1003: 'A3' }, yigin: [], ucan: 'TAŞI 1001 → B3', not: 'İstek bir NESNE oldu: komut' },
    { d: null, yer: { 1001: 'B3', 1003: 'A3' }, yigin: ['TAŞI 1001 → B3'], ucan: null, not: 'Çalıştı, geçmişe girdi' },
    { d: 'yukle', yer: { 1001: 'B3', 1003: 'A3' }, yigin: ['TAŞI 1001 → B3'], ucan: 'YÜKLE 1003', not: 'Yeni komut: kamyona yükle' },
    { d: null, yer: { 1001: 'B3', 1003: 'K' }, yigin: ['TAŞI 1001 → B3', 'YÜKLE 1003'], ucan: null, not: 'Geçmişte iki komut var' },
    { d: 'geri', yer: { 1001: 'B3', 1003: 'A3' }, yigin: ['TAŞI 1001 → B3'], ucan: null, not: '↶ Geri al: son komut kendini geri aldı' },
    { d: 'geri', yer: { 1001: 'A1', 1003: 'A3' }, yigin: [], ucan: null, not: '↶ Bir daha: o da kendini geri aldı' },
    { d: null, yer: { 1001: 'A1', 1003: 'A3' }, yigin: [], ucan: null, not: 'Her komut, neyi geri alacağını bilir' },
  ];

  CM.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: isteği nesneleştirmek</span>
          </div>
          <h1 class="intro-title">Command</h1>
          <div class="intro-sub">Komut <span>· “isteği bir nesneye koy; sakla, sıraya al, geri al”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir isteği bir <b>nesne</b> olarak paketle; böylece istemcileri farklı isteklerle <b>parametrelendirebilir</b>, istekleri <b>sıraya</b> koyabilir ya da <b>kaydedebilir</b> ve <b>geri alınabilen</b> işlemleri destekleyebilirsin.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🧾</span> Günlük hayattan</h3>
          <p>Restoranda garson siparişi bir <b>fişe</b> yazar ve mutfağa asar. Garson yemeği yapmayı bilmez; aşçı da fişi kimin
          yazdığını umursamaz. Fişler sıraya girer, iptal edilebilir, gün sonunda <b>kayıt</b> olarak kalır. Fiş, isteğin
          nesne hâlidir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Her işlemi <code>calistir()</code> ve <code>geriAl()</code> bilen küçük bir sınıf yap: <code>TasiKomutu</code>,
          <code>YukleKomutu</code>. Komut, işi yapacak nesneyi (depo, kamyon) ve geri almak için gereken bilgiyi
          <b>kendisi</b> tutar.</p>
          <p>Panel yalnızca <code>k.calistir()</code> der ve komutu geçmişe koyar; gece işi komutları kuyrukta bekletir.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>Dizgi + switch ile yapılan isteklerin bedelini görmek (boşa giden geri al, gece çöküşü)</li>
            <li>İsteği <b>nesne</b> yapmak: komut, alıcısını ve geri alma kaydını taşır</li>
            <li>Rolleri tanımak: ${['command', 'concreteCommand', 'invoker', 'receiver', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Sınırsız geri al / yinele, iş kuyruğu ve makro komut</li>
            <li>Command’ı Strategy, Memento ve Chain of Responsibility’den ayırmak</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/chain-of-responsibility">← Önceki kalıp: Chain of Responsibility</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const koli = { 1001: svg.querySelector('[data-koli="1001"]'), 1003: svg.querySelector('[data-koli="1003"]') };
    const yerle = (id, yer) => {
      const p = yer === 'K' ? HKAMYON : HRAF(yer);
      koli[id].style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    let t = 0;
    const tick = () => {
      const p = HPLAN[t % HPLAN.length];
      DP.$$('.hc-dugme', svg).forEach((b) => b.classList.toggle('is-on', b.getAttribute('data-d') === p.d));
      Object.keys(p.yer).forEach((id) => yerle(id, p.yer[id]));
      k.yigin.innerHTML = p.yigin
        .slice()
        .reverse()
        .map((ad, i) => `<g class="hc-kart${i === 0 ? ' is-top' : ''}"><rect x="22" y="${226 + i * 30}" width="148" height="25" rx="6"/><text x="32" y="${243 + i * 30}">${esc(ad)}</text></g>`)
        .join('');
      k.ucan.innerHTML = p.ucan ? `<g class="hc-kart is-ucan"><rect x="180" y="62" width="150" height="28" rx="7"/><text x="192" y="81">${esc(p.ucan)}</text></g>` : '';
      k.not.textContent = p.not;
      DP.flash(k.not, 'is-pop');
      t++;
    };
    tick();
    const timer = setInterval(tick, 1150);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const raflar = CM.RAFLAR.map((raf) => {
      const p = HRAF(raf);
      return `<g class="hc-raf"><rect x="${p.x}" y="${p.y}" width="52" height="46" rx="6"/><text x="${p.x + 5}" y="${p.y + 12}">${raf}</text></g>`;
    }).join('');
    const kutu = (id, ad) => `<g class="hc-koli" data-koli="${id}"><rect x="5" y="15" width="42" height="27" rx="5"/><text x="26" y="33" text-anchor="middle">${id}</text><title>${ad}</title></g>`;
    const d = (key, label, x, y) => `<g class="hc-dugme" data-d="${key}"><rect x="${x}" y="${y}" width="68" height="26" rx="7"/><text x="${x + 34}" y="${y + 17}" text-anchor="middle">${label}</text></g>`;
    return `
    <svg class="hero-svg cmd-hero" viewBox="0 0 560 360" role="img" aria-label="Paneldeki düğme bir komut nesnesi yaratıyor; komut rafı değiştirip geçmişe giriyor, geri al onu geri çıkarıyor">
      <text class="h-caption" x="280" y="28" text-anchor="middle">İstek bir nesne olunca: sakla, sıraya koy, geri al</text>
      <g class="hc-panel"><rect x="14" y="48" width="164" height="132" rx="12"/><text class="hc-t" x="28" y="70">OperatorPaneli</text>
        ${d('tasi', 'Taşı', 24, 82)}${d('yukle', 'Yükle', 100, 82)}${d('geri', '↶ Geri al', 24, 116)}${d('yinele', '↷ Yinele', 100, 116)}
        <text class="hc-s" x="28" y="166">k.calistir() + geçmiş</text></g>
      <text class="hc-sec" x="22" y="212">Geçmiş (yığın)</text>
      <g data-k="yigin"></g>
      ${raflar}
      <g class="hc-kamyon"><rect x="470" y="110" width="76" height="98" rx="8"/><text x="508" y="128" text-anchor="middle">kamyon</text></g>
      ${kutu(1001, 'Ali')}${kutu(1003, 'Zeynep')}
      <g data-k="ucan"></g>
      <text class="hc-not" data-k="not" x="380" y="300" text-anchor="middle"></text>
      <text class="h-sub hc-code" x="280" y="336" text-anchor="middle">panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));   panel.geriAl();</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  CM.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code cmd-left' });
    const right = kit.panel('Depo <span class="panel-sub">· isteği kim, nasıl yapıyor?</span>', { cls: 'panel-side cmd-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cmd-cv' });
    const consoleEl = h('div', { class: 'console cmd-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CM.roleOf, special: CM.special });

    const viewHost = h('div', { class: 'cmd-view' });
    const extra = h('div', { class: 'cmd-extra' });
    right.body.append(viewHost, extra);
    const stage = new CM.DepoSahne(viewHost);

    const files = (v) => CM.fileList(CM.naiveFiles(v));
    const asMap = (v) => {
      const F = CM.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => CM.run(CM.NV[v]).lines.map((l) => CM.consoleLine(l, { yokBad: true, yokNote: 'TAŞI KRG-1001 unutuldu!', errNote: '02:00' }));
    const STEPS = [
      {
        t: 'Panel isteği kendisi yapıyor',
        x: 'Sürüm 1: [[OperatorPaneli]]’ne her düğme isteği bir **dizgiyle** bildiriyor: `"TASI"`, `"YUKLE"`. Panel `switch` ile ne yapılacağını çözüp depoyu ve kamyonu kendisi çağırıyor. Operatör iki hata yaptı: Ali’nin kolisini yanlış rafa koydu, Zeynep’in İzmir’e gidecek ilacını Malatya kamyonuna yükledi. **Geri alma yok.**',
        v: 'v1', mark: ['OperatorPaneli.java', ['switch (islem) {', 'default -> throw'], 'focus'],
        st: { hl: { 'KRG-1001': 'bad', 'KRG-1003': 'bad' }, ghost: { 'KRG-1001': 'A1', 'KRG-1003': 'A3' }, banner: { text: 'İki hata, **geri alma yok**: KRG-1003 hangi raftan gelmişti?', tone: 'bad' } },
      },
      {
        t: 'Geri al eklendi: yalnızca son işlem',
        x: 'Sürüm 2: panele “Geri al” eklendi. Panel son işlemi üç alanda hatırlıyor: `sonIslem`, `sonKoli`, `sonRaf`. Operatör iki kez **geri al** dedi: ilki yüklemeyi geri aldı, ikincisinde kayıt çoktan silinmişti: **“geri alınacak işlem yok”**. Ali’nin kolisi hâlâ B3’te.',
        v: 'v2', diff: 'v1', mark: ['OperatorPaneli.java', ['private String sonIslem;', 'private String sonRaf;'], 'focus'], animateOut: true,
        st: { hl: { 'KRG-1001': 'bad', 'KRG-1003': 'ok' }, ghost: { 'KRG-1001': 'A1' }, banner: { text: 'İkinci **geri al** boşa gitti: Ali’nin kolisi hâlâ **B3**’te (A1 olmalıydı).', tone: 'bad' } },
      },
      {
        t: 'Gece işi: metin satırları',
        x: 'Sürüm 2.1: gece vardiyası işleri bir listeye **metin** olarak yazıyor; [[GeceIsi]] 02:00’de satırları bölüp panelin `switch`’ini **kopyalamış** hâliyle yapıyor. Son satır Türkçe yazıldı: `"YÜKLE"`. Derleyici bunu göremez; program gece 02:00’de çöktü, kamyon Selin’in kolisi olmadan yola çıktı.',
        v: 'v3', diff: 'v2', mark: ['Main.java', 'gece.ekle("YÜKLE KRG-1005");', 'bad'], animateOut: true,
        st: { hl: { 'KRG-1005': 'bad', 'KRG-1001': 'ok', 'KRG-1004': 'ok' }, banner: { text: '02:00 · **bilinmeyen işlem: YÜKLE** · program çöktü, KRG-1005 depoda kaldı.', tone: 'bad' } },
      },
      {
        t: 'Teşhis — İstek bir dizgi, iş çağıranda',
        x: 'İsteği yapan kod, isteği **başlatan** yere gömülü: panel ve gece işi depoyu ve kamyonu tanıyor, aynı `switch`’i iki kez yazıyor. İstek bir dizgi olduğu için ne **geri alma bilgisini** taşıyabiliyor ne de derleyici yanlış yazımı yakalıyor. Ya her istek, ne yapacağını ve nasıl geri alınacağını bilen bir **nesne** olsaydı?',
        v: 'v3', diag: true,
      },
    ];

    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (dizgi + switch)', v2: 'sürüm 2.0 (+ geri al)', v3: 'sürüm 2.1 (+ gece işi)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        CM.renderConsole(consoleEl, CM.cmd(true), out(s.v), { animateFrom: info.animate && s.animateOut ? 0 : null });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'GeceIsi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 1) cv.mark('OperatorPaneli.java', 'sonIslem = null;', 'bad', { show: false, scroll: false });
        if (i === 2) cv.mark('GeceIsi.java', 'switch (p[0]) {', 'focus', { show: false, scroll: false });
        if (s.diag) {
          cv.mark('GeceIsi.java', ['switch (p[0]) {', 'default -> throw'], 'focus');
          cv.mark('GeceIsi.java', 'default -> throw', 'bad', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = CM.sonDurum(CM.NV[s.v], s.st);
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        extra.innerHTML = `
          <div class="cmd-evidence">
            <span class="cmd-ev-k">Gündüz</span><b class="is-bad">2. geri al boşa gitti</b>
            <span class="cmd-ev-k">Gece</span><b class="is-bad">“YÜKLE” → çöküş (02:00)</b>
            <span class="cmd-ev-k">Kopya</span><b>2 switch</b>
            <span class="cmd-ev-why">${md('İstek bir dizgi ve iş, isteği başlatan sınıfın içinde: panel de gece işi de depoyu ve kamyonu kendisi yönetiyor.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Çağıran işi kendisi yapıyor:** panel ve gece işi depoyu ve kamyonu tanıyor; aynı `switch` iki yerde. Yeni bir işlem (ör. “raf ayır”) iki sınıfı birden değiştirmek demek.')}</li>
              <li>${md('**Geri alma bilgisi isteğe ait değil:** panel yalnızca son işlemin üç alanını tutuyor; iki işlem geri, bilgi kayboluyor. Sınırsız geri al için her isteğin kendi kaydı gerekir.')}</li>
              <li>${md('**İstek bir dizgi:** sıraya konan “iş”, derleyicinin denetleyemediği bir metin. Yanlış yazım ancak gece 02:00’de, iş yarıdayken ortaya çıkıyor.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Restoran fişi gibi:** garson siparişi fişe yazar; fiş mutfakta sıraya girer, iptal edilebilir, gün sonunda kayıt olur. Garson yemek yapmayı bilmez; fiş, isteğin **nesne** hâlidir.')}</div>`;
        if (info.animate) DP.flash(extra, 'is-pop');
      },
    });
    return kit.stepApi(stepper, {
      destroy: () => {
        stepper.destroy();
        stage.destroy();
      },
    });
  };

  // ================================================================== 3. ÇÖZÜM
  CM.scenes.solution = function (root, ctx) {
    const R = CM.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code cmd-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cmd-cv' });
    const consoleEl = h('div', { class: 'console cmd-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CM.roleOf, special: CM.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, aggregation: 'tutar', fmLabel: 'komutu çalıştırır, geçmişe koyar' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Arayüz: Komut', 'Her işlem bir komut sınıfı', 'Panel komutu çalıştırır, geçmişe koyar', 'Gece işi komut kuyruğu tutar'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, CM.solutionDiagram(0), { roles: CM.roles, roleTags: false });

    const outAt = (i) => CM.run(CM.refactorProgs[i]).lines.map((l) => CM.consoleLine(l, { yokBad: true }));
    const STEPS = [
      { t: 'Başlangıç — istekler dizgi, iş çağıranda', x: 'Panel tek kayıtlık “geri al”la, gece işi kopya `switch` ve metin planıyla çalışıyor; ikinci geri al boşa gidiyor, gece 02:00’de program çöküyor. Dört adımda her isteği bir **nesneye** dönüştüreceğiz. Depo ve kamyona dokunmayacağız.', focus: 'GeceIsi.java', mark: 'default -> throw', kind: 'bad' },
      { t: 'Adım 1 — Arayüz: `Komut`', x: '[[Komut]] bir isteğin her şeyi: `calistir()`, `geriAl()` ve ekranda göstermek için `ad()`. Henüz kimse kullanmıyor; konsol değişmedi.', focus: 'Komut.java', marks: ['void calistir();', 'void geriAl();'] },
      { t: 'Adım 2 — Her işlem bir komut sınıfı', x: '[[TasiKomutu]] ve [[YukleKomutu]]: switch’in iki dalı iki sınıf oldu. Önemli fark: komut, işi yapacak nesneyi (`depo`, `kamyon`) ve **geri almak için gereken bilgiyi** kendi alanında tutuyor (`onceki`, `raf`). Panelin üç alanı artık gereksiz.', focus: 'TasiKomutu.java', marks: ['private String onceki;', 'onceki = depo.yeri(koli);', 'depo.tasi(koli, onceki);'] },
      { t: 'Adım 3 — Panel komutu çalıştırır, geçmişe koyar', x: '[[OperatorPaneli]]’nin `switch`’i ve üç alanı **silindi**: `yap(k)` komutu çalıştırıp **geçmiş yığınına** koyuyor, `geriAl()` yığından çekip `k.geriAl()` diyor. Konsola bakın: iki geri al da çalıştı, Ali’nin kolisi A1’e döndü. Gece işi hâlâ eski yolda: 02:00’de yine çöküyor.', focus: 'OperatorPaneli.java', marks: ['k.calistir();', 'gecmis.push(k);', 'Komut k = gecmis.pop();'] },
      { t: 'Adım 4 — Gece işi komut kuyruğu tutar', x: '[[GeceIsi]] artık dizgi değil **komut** biriktiriyor: `List<Komut>`. Kopya `switch` ve satır bölme gitti; yanlış yazılmış bir komut adı artık **derlenmez**. Main komutları yaratıp kuyruğa koyuyor; 02:00’de üçü de çalıştı.', focus: 'GeceIsi.java', marks: ['private final List<Komut> kuyruk = new ArrayList<>();', 'k.calistir();'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Çağıranlar (panel, gece işi) depoyu ve kamyonu **tanımıyor**; yalnızca `Komut` türünü. Her komut kendi geri alma kaydını taşıyor: sınırsız geri al ve yinele. Komutlar sıraya, kayda, makroya girebilen nesneler. Yeni işlem = yeni komut sınıfı; çağıranlar değişmez.', focus: 'Main.java', marks: ['panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));', 'gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1005"));'] },
    ];

    const filesAt = (i) => CM.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 7600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        CM.renderConsole(consoleEl, CM.cmd(true), outAt(ri), { animateFrom: info.animate && (i === 3 || i === 4) ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));

        diagram.update(CM.solutionDiagram(Math.min(i, 4)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('GeceIsi', '02:00 çöküş', 'bad');
          diagram.badge('OperatorPaneli', 'tek kayıt', 'bad');
          diagram.focus({ classes: ['OperatorPaneli', 'GeceIsi'], edges: ['p-depo', 'g-depo'] });
        }
        if (i === 1) {
          diagram.badge('Komut', 'YENİ', 'new');
          diagram.focus({ classes: ['Komut'] });
        }
        if (i === 2) {
          diagram.badge('TasiKomutu', 'YENİ', 'new');
          diagram.badge('YukleKomutu', 'YENİ', 'new');
          diagram.focus({ classes: ['TasiKomutu', 'YukleKomutu'], edges: ['r-tasi', 'r-yukle', 'a-tasi', 'a-yukle-depo', 'a-yukle-kamyon'] });
        }
        if (i === 3) {
          diagram.badge('OperatorPaneli', 'sadeleşti', 'new');
          diagram.focus({ classes: ['OperatorPaneli', 'Komut'], edges: ['gecmis'] });
        }
        if (i === 4) {
          diagram.badge('GeceIsi', 'sadeleşti', 'new');
          diagram.focus({ classes: ['GeceIsi', 'Komut'], edges: ['kuyruk'] });
        }
        if (i === 5) diagram.focus({ classes: ['OperatorPaneli', 'GeceIsi', 'Komut'], edges: ['gecmis', 'kuyruk'] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 5 && k < 4));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
