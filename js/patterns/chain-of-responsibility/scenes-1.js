/*
 * Chain of Responsibility — sahneler (1/3): Giriş, Sorun, Çözüm
 */
(function () {
  'use strict';
  const CR = DP.cr;
  const { h } = DP;
  const kit = DP.kit;
  const esc = DP.esc;
  const md = (t) => DP.md(t, CR.roleOf);
  CR.md = md;
  CR.scenes = CR.scenes || {};
  const ui = (CR.ui = {
    foot: (root) => kit.foot(root, CR.roleOf),
    roleChip: (key) => kit.roleChip(CR.roles, key),
  });

  /** Konsol: satırlar {t, parts, bad, dim, note}; parts verilirse parçalar renkli yazılır. */
  CR.renderConsole = function (el, cmd, lines, o) {
    o = o || {};
    el.innerHTML = '<div class="console-head"><span></span><span></span><span></span> ' + (o.title || 'Konsol') + '</div>';
    if (cmd) el.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
    lines.forEach((l, i) => {
      const cls = ['console-line'];
      if (l.bad) cls.push('is-badline');
      if (l.dim) cls.push('is-dim');
      if (l.hl) cls.push('is-hlline');
      if (o.animateFrom != null && i >= o.animateFrom) cls.push('is-new');
      const html = l.parts ? l.parts.map((p, j) => `<span class="cl-${p.k}${l.newFrom != null && j >= l.newFrom ? ' is-newp' : ''}">${esc(p.t)}</span>`).join('') : esc(l.t);
      const row = h('div', { class: cls.join(' '), html });
      if (l.note) row.appendChild(h('span', { class: 'console-note' }, '  ← ' + l.note));
      el.appendChild(row);
    });
    if (o.cursor) el.appendChild(h('div', { class: 'console-cursor' }));
    el.scrollTop = el.scrollHeight;
  };
  /** Çıktı satırı → konsol satırı (kural ihlali kırmızı) */
  CR.consoleLine = (l, o) => {
    o = o || {};
    const parts = CR.lineParts(l, o.upto);
    const bad = parts.some((p) => p.k === 'bad');
    return { t: parts.map((p) => p.t).join(''), parts, bad, note: bad ? o.badNote || null : null, hl: !!o.hl };
  };
  CR.cmd = (javac) => `$ ${javac ? 'javac *.java && ' : ''}java Main`;

  /** Kalıpsız sürüm → sahne durumu (merdivenler + pano) */
  CR.naiveState = function (v, o) {
    o = o || {};
    const P = CR.NV[v];
    const ladders = [{ cls: 'Kurye', bolge: 'Malatya', rows: CR.merdivenBilgi(P.kurye), assume: !!o.assume }];
    if (P.istanbul) ladders.push({ cls: 'IstanbulKuryesi', bolge: 'İstanbul', rows: CR.merdivenBilgi('ist'), assume: !!o.assume });
    const run = CR.naiveRun(v);
    const board = CR.GUNLUK.map((g) => ({
      g,
      yerler: run.filter((l) => l.g.no === g.no).map((l) => ({ bolge: l.bolge, yer: l.yer, bad: l.k === 'bad' })),
    }));
    return { mode: 'naive', ladders, board, banner: o.banner || null };
  };

  /** Zincir programı → sahne durumu (halkalardaki teslim sayıları + pano) */
  CR.chainState = function (prog, o) {
    o = o || {};
    const z = prog.zincirler[o.z || 0];
    const lines = CR.run(prog).filter((l) => l.bolge === z.bolge);
    const kayip = lines.some((l) => l.kayip);
    return {
      mode: 'chain',
      bolge: z.bolge,
      keys: z.keys,
      links: CR.countLinks(z.keys, lines),
      end: kayip ? 'kayip' : null,
      parcel: null,
      board: CR.boardOf(lines),
      fresh: o.fresh || null,
      banner: o.banner || null,
    };
  };

  // ================================================================== 1. GİRİŞ
  /** Giriş animasyonu: dört gönderi Malatya zincirinden tek tek geçer */
  const HK = CR.MALATYA;
  const HW = 88;
  const HG = 17;
  const HX = (i) => 26 + i * (HW + HG);
  const HY = 132;
  const HG_PARCELS = [0, 1, 2, 5];

  CR.scenes.intro = function (root, ctx) {
    const el = h('div', { class: 'scene scene-intro' });
    el.innerHTML = `
      <div class="intro-grid">
        <section class="intro-main">
          <div class="chips">
            <span class="chip chip-cat is-behav">Davranışsal · Behavioral</span>
            <span class="chip">GoF · 1994</span>
            <span class="chip">Anahtar kelime: iletme</span>
          </div>
          <h1 class="intro-title">Chain of Responsibility</h1>
          <div class="intro-sub">Sorumluluk Zinciri <span>· “işleyemiyorsan sonrakine ilet”</span></div>
          <blockquote class="intent">
            <div class="intent-label">Amaç</div>
            <p>Bir isteğin göndericisini alıcısına <b>bağlamaktan kaçın</b>; isteği işleme fırsatını birden çok nesneye ver. Alıcı nesneleri <b>zincirle</b> ve isteği, bir nesne onu işleyene kadar zincir boyunca <b>ilet</b>.</p>
            <footer>— Gamma, Helm, Johnson, Vlissides (GoF), <i>Design Patterns</i>, 1994</footer>
          </blockquote>
        </section>
        <section class="intro-hero" aria-label="Kalıbın kısa animasyonu">${heroSvg()}</section>
      </div>
      <div class="intro-cards">
        <article class="card">
          <h3><span class="card-ic">🚪</span> Günlük hayattan</h3>
          <p>Kurye kapıyı çalar; alıcı yoksa <b>komşuya</b> sorar, o da olmazsa <b>akıllı dolaba</b>, dolap da olmazsa
          <b>şubeye</b> bırakır. Her seçenek yalnızca kendi kuralına bakar: “Bunu ben alabilir miyim? Alamıyorsam
          sıradakine.” Çağrı merkezindeki <b>yönlendirme</b> de böyledir: birinci kademe, ikinci kademe, uzman.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🧩</span> Fikir</h3>
          <p>Her seçeneği aynı soyut sınıftan türeyen bir <b>halka</b> yap. Halka işleyebiliyorsa işler; işleyemiyorsa
          isteği <code>sonraki.teslimEt(g)</code> ile ileri verir. Gönderen (kurye) yalnızca zincirin <b>başını</b> tanır;
          kimin işleyeceğini bilmez.</p>
          <p>Zinciri ve sırasını <b>kurulumda</b> (Main) belirlersin: bölgeye göre farklı sıra, yeni halka eklemek tek satır.</p>
        </article>
        <article class="card">
          <h3><span class="card-ic">🎯</span> Bu derste</h3>
          <ol class="objectives">
            <li>if/else merdiveninin gizli varsayımlarını görmek (dolaptaki ilaç)</li>
            <li>Her seçeneği kendi kuralıyla bir halkaya dönüştürmek</li>
            <li>Rolleri tanımak: ${['handler', 'concreteHandler', 'client'].map((r) => ui.roleChip(r)).join(' ')}</li>
            <li>Sıranın önceliği belirlediğini ve zincirin <b>çalışırken</b> kurulduğunu görmek</li>
            <li>“Kimse işlemezse?” sorusunu ve kalıbı Decorator’dan ayırmayı öğrenmek</li>
          </ol>
        </article>
      </div>
      <div class="intro-cta">
        <button class="btn btn-primary btn-lg" type="button" data-go>Sorunla başlayalım →</button>
        <a class="btn btn-ghost" href="#/proxy">← Önceki kalıp: Proxy</a>
        <span class="hint">ya da klavyede <kbd>→</kbd> tuşuna basın</span>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-go]').addEventListener('click', () => ctx.goScene('sorun'));

    const svg = el.querySelector('.hero-svg');
    const k = {};
    DP.$$('[data-k]', svg).forEach((n) => (k[n.getAttribute('data-k')] = n));
    const links = DP.$$('.ch-link', svg);
    // her gönderi: zincirdeki adımlar, sonra kısa bir duraklama
    const plan = [];
    HG_PARCELS.forEach((gi) => {
      const g = CR.GUNLUK[gi];
      const r = CR.zincirCalistir(HK, g);
      plan.push({ g, r, i: -1 });
      r.adim.forEach((a, i) => plan.push({ g, r, i }));
      plan.push({ g, r, i: r.adim.length - 1, hold: true });
      plan.push({ g, r, i: r.adim.length - 1, hold: true });
    });
    let t = 0;
    const tick = () => {
      const p = plan[t % plan.length];
      const g = p.g;
      if (p.i === -1) {
        k.no.textContent = `${g.no} · ${g.alici.split(' ')[0]} · ${g.kg} kg`;
        k.soguk.classList.toggle('is-on', g.soguk);
        k.kapi.textContent = CR.KAPI[g.kapi].t;
        k.res.textContent = 'kurye: “kim alacak, bilmiyorum; zincire veriyorum”';
        k.res.setAttribute('class', 'ch-res');
        DP.flash(k.card, 'is-pop');
      }
      links.forEach((ln, j) => {
        const a = p.r.adim[j];
        const done = a && j <= p.i;
        ln.classList.toggle('is-ok', !!(done && a.ok));
        ln.classList.toggle('is-pass', !!(done && !a.ok));
        ln.classList.toggle('is-on', j === p.i && !p.hold);
        const m = ln.querySelector('.ch-m');
        m.textContent = done ? (a.ok ? '✓' : '✗') : '';
      });
      // gönderi jetonu: bakılan halkanın üstünde
      const at = p.i < 0 ? -1 : p.i;
      k.tok.style.transform = at < 0 ? 'translate(280px, 96px)' : `translate(${HX(at) + HW / 2}px, ${HY - 14}px)`;
      if (p.hold && p.i === p.r.adim.length - 1) {
        const yer = CR.HALKA[p.r.yer].ad;
        const gecen = p.r.adim.length - 1;
        k.res.textContent = gecen ? `→ ${yer} teslim aldı · ${gecen} halka “bana değil” dedi` : `→ ${yer} teslim aldı · ilk halkada`;
        k.res.setAttribute('class', 'ch-res is-ok');
      }
      t++;
    };
    tick();
    const timer = setInterval(tick, 800);
    return { destroy: () => clearInterval(timer) };
  };

  function heroSvg() {
    const links = HK.map(
      (key, i) => `<g class="ch-link rc rc-4"><rect x="${HX(i)}" y="${HY}" width="${HW}" height="92" rx="12"/>
        <circle class="ch-ic" cx="${HX(i) + HW / 2}" cy="${HY + 30}" r="19"/>${CR.icon(key, HX(i) + HW / 2 - 12, HY + 18, 1)}
        <text class="ch-t" x="${HX(i) + HW / 2}" y="${HY + 70}" text-anchor="middle">${CR.HALKA[key].ad}</text>
        <text class="ch-m" x="${HX(i) + HW - 12}" y="${HY + 20}" text-anchor="middle"></text></g>`
    ).join('');
    const arrows = HK.slice(0, -1)
      .map((key, i) => {
        const x1 = HX(i) + HW + 2;
        const x2 = HX(i + 1) - 2;
        return `<path class="ch-ar" d="M${x1} ${HY + 46} H${x2}"/><polyline class="ch-ar" points="${x2 - 6},${HY + 41} ${x2},${HY + 46} ${x2 - 6},${HY + 51}"/>`;
      })
      .join('');
    return `
    <svg class="hero-svg cr-hero" viewBox="0 0 560 360" role="img" aria-label="Gönderiler teslim zincirinde halkadan halkaya ilerliyor; biri teslim alınca duruyor">
      <text class="h-caption" x="280" y="28" text-anchor="middle">İstek, biri üstlenene kadar zincirde ilerler</text>
      <g class="ch-card" data-k="card"><rect x="150" y="46" width="260" height="46" rx="12"/>${CR.icon('paket', 162, 57, 1)}
        <text class="ch-no" data-k="no" x="194" y="66">KRG-1001</text>
        <text class="ch-kapi" data-k="kapi" x="194" y="84">alıcı evde</text>
        <g class="ch-soguk" data-k="soguk">${CR.icon('soguk', 378, 57, 1)}</g></g>
      ${arrows}${links}
      <g class="ch-tok" data-k="tok"><circle r="9"/></g>
      <text class="ch-res" data-k="res" x="280" y="262" text-anchor="middle"></text>
      <text class="h-sub ch-code" x="280" y="300" text-anchor="middle">zincir.teslimEt(gonderi);   // kim alacak? kurye bilmez</text>
      <text class="h-sub ch-code2" x="280" y="324" text-anchor="middle">if (dene(g)) işle; else sonraki.teslimEt(g);</text>
    </svg>`;
  }

  // ================================================================== 2. SORUN
  CR.scenes.problem = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-46' });
    const left = kit.panel('Kalıpsız kod · <span class="ver"></span>', { cls: 'panel-code cr-left' });
    const right = kit.panel('Kapı önü <span class="panel-sub">· kararı kim veriyor?</span>', { cls: 'panel-side cr-right' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cr-cv' });
    const consoleEl = h('div', { class: 'console cr-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CR.roleOf, special: CR.special });

    const viewHost = h('div', { class: 'cr-view' });
    const extra = h('div', { class: 'cr-extra' });
    right.body.append(viewHost, extra);
    const stage = new CR.Hat(viewHost);

    const order = ['Main', 'Kurye', 'IstanbulKuryesi', 'Gonderi', 'Kapi', 'Gunluk'];
    const files = (v) => CR.fileList(CR.naiveFiles(v), order);
    const asMap = (v) => {
      const F = CR.naiveFiles(v);
      const m = {};
      Object.keys(F).forEach((n) => (m[n + '.java'] = F[n]));
      return m;
    };
    const out = (v) => CR.naiveRun(v).map((l) => CR.consoleLine(l, { badNote: l.yer === 'Komşu' ? 'ilaç komşuda!' : 'ilaç dolapta!' }));
    const STEPS = [
      {
        t: 'Kurye kapıda karar veriyor',
        x: 'Sürüm 1: [[Kurye]] her kapıda **kendisi** karar veriyor. Alıcı evdeyse ona, komşu evdeyse komşuya, yoksa şubeye. Bütün seçenekler ve sıraları tek bir `if/else` merdiveninde. Panoya bakın: Zeynep’in **ilacı** komşuya bırakıldı.',
        v: 'v1', mark: ['Kurye.java', ['if (g.kapi() == Kapi.ALICI_EVDE) {', 'yer = "Şube";'], 'focus'],
        st: { assume: true, banner: { text: 'Zeynep’in **soğuk zincir** ilacı komşuya bırakıldı: eczane şikâyetçi!', tone: 'bad' } },
      },
      {
        t: 'Yeni kurallar: soğuk zincir, dolap, ağırlık',
        x: 'Sürüm 2: soğuk zincir yalnızca şubeye, küçük koliler **akıllı dolaba**, şube 20 kg’dan ağırını almıyor (göndericiye **iade**). Geliştirici soğuk zincir dalını **erkene** koydu; aşağıdaki komşu ve dolap dalları artık “soğuk değil” diye **varsayıyor**. Kodda bu varsayım yalnızca bir yorum.',
        v: 'v2', diff: 'v1', mark: ['Kurye.java', '} else if (g.kg() <= 5) {', 'focus'], animateOut: true,
        st: { assume: true, banner: { text: 'Her şey yerinde; ama **komşu** ve **dolap** dalları, soğuk zincir dalının **üstte** durmasına güveniyor.' } },
      },
      {
        t: 'İstanbul: önce dolap',
        x: 'İstanbul’da apartmanlar var; dolap önce denensin istendi. Geliştirici [[Kurye]]’yi **kopyaladı** ([[IstanbulKuryesi]]) ve dolap dalını yukarı taşıdı. Derleyici sustu; ama dolap dalı artık soğuk zincir dalının **üstünde**: Zeynep’in ilacı akıllı dolaba girdi.',
        v: 'v3', diff: 'v2', mark: ['IstanbulKuryesi.java', '} else if (g.kg() <= 5) {', 'bad'], animateOut: true,
        st: { assume: true, banner: { text: 'İstanbul’da ilaç **akıllı dolapta**: dalların sırası değişince gizli varsayım bozuldu.', tone: 'bad' } },
      },
      {
        t: 'Teşhis — Kararlar gönderende',
        x: 'Gönderen (kurye) bütün alıcıları, sıralarını ve kurallarını **kendisi** biliyor. Her `else if`, üstündeki dalların tutmadığını varsayıyor; sırayı değiştirmek anlamı değiştiriyor. Ya her seçenek kendi kuralını **eksiksiz** bilse ve işleyemediği gönderiyi **sonrakine** verse?',
        v: 'v3', diag: true,
      },
    ];

    const foot = ui.foot(el);
    let last = null;
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 7400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        left.head.querySelector('.ver').textContent = { v1: 'sürüm 1.0 (üç seçenek)', v2: 'sürüm 2.0 (+ kurallar)', v3: 'sürüm 2.1 (+ İstanbul)' }[s.v];
        // önce konsol: yüksekliği değişince işaretli satır kod panelinin dışında kalmasın
        CR.renderConsole(consoleEl, CR.cmd(true), out(s.v), { animateFrom: info.animate && s.animateOut ? 0 : null });
        cv.setFiles(files(s.v), { active: s.mark ? s.mark[0] : 'IstanbulKuryesi.java', prev: s.diff ? asMap(s.diff) : null, keepActive: false });
        if (s.mark) cv.mark(s.mark[0], s.mark[1], s.mark[2]);
        if (i === 1) cv.mark('Kurye.java', '} else if (g.sogukZincir()) {', 'ok', { show: false, scroll: false });
        if (i === 2) cv.mark('IstanbulKuryesi.java', '} else if (g.sogukZincir()) {', 'focus', { show: false, scroll: false });
        if (s.diag) {
          cv.mark('IstanbulKuryesi.java', ['if (g.kapi() == Kapi.ALICI_EVDE) {', 'yer = "İade";'], 'focus');
          cv.mark('IstanbulKuryesi.java', '} else if (g.kg() <= 5) {', 'bad', { scroll: false });
        }
        right.el.classList.toggle('is-diag', !!s.diag);
        if (!s.diag) {
          const st = CR.naiveState(s.v, s.st);
          stage.render(st, last, { animate: info.animate });
          last = st;
          extra.innerHTML = '';
          return;
        }
        extra.innerHTML = `
          <div class="cr-evidence">
            <span class="cr-ev-k">Malatya</span><b class="is-ok">ilaç şubede</b>
            <span class="cr-ev-k">İstanbul</span><b class="is-bad">KRG-1003 akıllı dolapta</b>
            <span class="cr-ev-k">Kopya</span><b>2 merdiven × 6 dal</b>
            <span class="cr-ev-why">${md('Kural (“soğuk zincir yalnızca şubeye”) bir dalın **yerinde** saklıydı; dallar yer değiştirince kural sessizce kayboldu.')}</span>
          </div>
          <div class="req-card is-diagnosis">
            <div class="diag-title">Teşhis</div>
            <ul class="problems">
              <li>${md('**Gönderen, alıcıların hepsine bağlı:** kurye; alıcıyı, komşuyu, dolabı, şubeyi ve iadeyi tanıyor, sıralarını da kendisi belirliyor. Yeni bir seçenek (anlaşmalı market) kuryenin kodunu değiştirmek demek.')}</li>
              <li>${md('**Gizli varsayımlar:** her `else if`, üstündeki koşulların **tutmadığını** varsayıyor. Dolap dalının “soğuk değil” şartı kodda yok; yalnızca sırada var.')}</li>
              <li>${md('**Sıra değişince kopya:** bölgeye göre başka bir sıra, merdiveni kopyalayıp yeniden dizmek demek. Her kopya, kuralların bir kez daha dağılması.')}</li>
            </ul>
          </div>
          <div class="sg-aside">${md('💬 **Çağrı merkezi gibi:** birinci kademe çözemediği sorunu ikinciye, o da uzmana aktarır. Müşteri kimin çözeceğini bilmez; her kademe yalnızca **kendi yetkisine** bakar. Sırayı değiştirmek kademelerin işini bozmaz.')}</div>`;
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
  CR.scenes.solution = function (root, ctx) {
    const R = CR.refactor;
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-diag' });
    const left = kit.panel('Yeniden düzenleme (refactoring)', { cls: 'panel-code cr-left' });
    const right = kit.panel('Sınıf diyagramı', { cls: 'panel-side panel-diagram' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    const cvHost = h('div', { class: 'cr-cv' });
    const consoleEl = h('div', { class: 'console cr-console' });
    left.body.append(cvHost, consoleEl);
    const cv = new DP.CodeView(cvHost, { roleOf: CR.roleOf, special: CR.special });
    const diagHost = h('div', { class: 'diag-host' });
    const recipe = h('ol', { class: 'recipe' });
    const legend = kit.umlLegend({ association: true, fmLabel: 'şablon: dene, olmazsa sonrakine ilet' });
    right.body.append(h('div', { class: 'recipe-wrap' }, h('div', { class: 'recipe-title' }, 'Dönüşüm tarifi'), recipe), diagHost, legend);
    ['Soyut halka: sonraki + teslimEt', 'Her dal kendi kuralıyla bir halka', 'Kurye zincirin başını tanır; sırayı Main kurar'].forEach((t, i) => recipe.appendChild(h('li', { 'data-i': String(i + 1) }, t)));
    const diagram = new DP.ClassDiagram(diagHost, CR.solutionDiagram(0), { roles: CR.roles, roleTags: false });

    const outAt = (i) => CR.refactorOutputs[i].map((l) => CR.consoleLine(l, { badNote: 'ilaç dolapta!' }));
    const STEPS = [
      { t: 'Başlangıç — kararlar kuryede', x: 'İki kurye, iki merdiven ve İstanbul’da dolaba giren bir ilaç. Üç adımda her seçeneği **kendi kuralını bilen** bir halkaya dönüştüreceğiz; kurye yalnızca zincirin başını tanıyacak.', focus: 'IstanbulKuryesi.java', mark: '} else if (g.kg() <= 5) {', kind: 'bad' },
      { t: 'Adım 1 — Soyut halka: `TeslimatAdimi`', x: '[[TeslimatAdimi]] bir halkanın iskeleti: `sonraki` alanı zincirdeki bir sonraki halkayı tutar. `teslimEt(g)` bir **şablon**: önce `dene(g)`; tutarsa teslim, tutmazsa isteği `sonraki.teslimEt(g)` ile ileri verir. Sonraki yoksa gönderi **kayıp**. `sonra(s)`, s’yi döndürdüğü için zincir tek ifadede kurulur.', focus: 'TeslimatAdimi.java', marks: ['private TeslimatAdimi sonraki;', 'sonraki.teslimEt(g);', 'protected abstract boolean dene(Gonderi g);'] },
      { t: 'Adım 2 — Her dal bir halka', x: 'Merdivenin her dalı bir sınıf oldu. Önemli fark: kural artık **eksiksiz**. [[KomsuyaTeslim]] ve [[DolabaTeslim]] soğuk zinciri **kendileri** reddediyor; hiçbiri üstündeki dallara güvenmiyor. Kuryeler hâlâ eski merdivenle çalışıyor, konsol değişmedi.', focus: 'KomsuyaTeslim.java', marks: ['return g.kapi() == Kapi.KOMSU_EVDE && !g.sogukZincir() && g.kg() <= 10;'] },
      { t: 'Adım 3 — Kurye zinciri tanır, sırayı Main kurar', x: '[[Kurye]]’nin merdiveni **silindi**: tek alanı zincirin başı, tek işi `zincir.teslimEt(g)`. [[IstanbulKuryesi]] de silindi; [[Main]] aynı sınıflarla **iki ayrı zincir** kuruyor: Malatya ve İstanbul. Konsola bakın: İstanbul’da ilaç dolabı denedi, reddedildi, şubeye ulaştı.', focus: 'Main.java', marks: ['TeslimatAdimi istanbulZinciri = new AliciyaTeslim();', 'Kurye istanbul = new Kurye("İstanbul", istanbulZinciri);'] },
      { t: 'Sonuç — Ne kazandık?', x: 'Kurye beş seçeneğin **hiçbirini** tanımıyor; yalnızca `TeslimatAdimi` türünü. Her halka kendi kuralını eksiksiz biliyor: **sıra değişse de** kural bozulmuyor. Yeni bölge = Main’de yeni bir zincir; yeni seçenek = yeni bir halka sınıfı.', focus: 'Kurye.java', marks: ['private final TeslimatAdimi zincir;', 'zincir.teslimEt(g);'] },
    ];

    const filesAt = (i) => CR.refactorOrder.filter((k) => R[i][k]).map((k) => ({ name: k + '.java', code: R[i][k] }));
    const asMap = (i) => {
      const m = {};
      Object.keys(R[i]).forEach((k) => (m[k + '.java'] = R[i][k]));
      return m;
    };

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t.replace(/`/g, '')),
      delayOf: () => 7400,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        const ri = Math.min(i, R.length - 1);
        // önce konsol, sonra koddaki işaret
        CR.renderConsole(consoleEl, CR.cmd(true), outAt(ri), { animateFrom: info.animate && i === 3 ? 0 : null });
        const showDiff = i >= 1 && i <= R.length - 1;
        cv.setFiles(filesAt(ri), { active: s.focus, prev: showDiff ? asMap(ri - 1) : null, keepActive: false });
        if (s.mark) cv.mark(s.focus, s.mark, s.kind || 'focus');
        (s.marks || []).forEach((m, k) => cv.mark(s.focus, m, 'focus', { scroll: k === 0 }));
        if (i === 3) cv.mark('Kurye.java', 'zincir.teslimEt(g);', 'focus', { show: false, scroll: false });

        diagram.update(CR.solutionDiagram(Math.min(i, 3)), { animate: info.animate });
        diagram.clearBadges();
        diagram.clearFocus();
        if (i === 0) {
          diagram.badge('IstanbulKuryesi', 'ilaç dolapta', 'bad');
          diagram.focus({ classes: ['Kurye', 'IstanbulKuryesi'] });
        }
        if (i === 1) {
          diagram.badge('TeslimatAdimi', 'YENİ', 'new');
          diagram.focus({ classes: ['TeslimatAdimi'], edges: ['sonraki'], members: [['TeslimatAdimi', 'teslimEt']] });
        }
        if (i === 2) {
          diagram.badge('KomsuyaTeslim', 'kural tam', 'new');
          diagram.focus({ classes: CR.MALATYA.map((k) => CR.HALKA[k].cls), edges: CR.MALATYA.map((k) => 'r-' + k) });
        }
        if (i === 3) {
          diagram.badge('Kurye', 'sadeleşti', 'new');
          diagram.focus({ classes: ['Kurye', 'TeslimatAdimi'], edges: ['zincir', 'sonraki'] });
        }
        if (i === 4) diagram.focus({ classes: ['Kurye', 'TeslimatAdimi'], edges: ['zincir'], members: [['Kurye', 'zincir']] });
        DP.$$('li', recipe).forEach((li, k) => {
          li.classList.toggle('is-done', k + 1 < i || (i === 4 && k < 3));
          li.classList.toggle('is-current', k + 1 === i);
        });
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };
})();
