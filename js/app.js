/*
 * Uygulama kabuğu: yönlendirme (#/kalip/sahne), ana sayfa, sahne sekmeleri,
 * klavye kısayolları, tema, yakınlaştırma, tam ekran, kalem ve yardım penceresi.
 */
(function () {
  'use strict';
  const { h } = DP;

  const ICON = {
    zoomOut: '<svg viewBox="0 0 24 24"><text x="2" y="17" font-size="13" font-weight="700" fill="currentColor" font-family="Segoe UI, sans-serif">A</text><path d="M14 12h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24"><text x="1" y="18" font-size="16" font-weight="700" fill="currentColor" font-family="Segoe UI, sans-serif">A</text><path d="M14 12h8M18 8v8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1.2-4.6L16.5 4.1a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z"/><path d="M14.5 6l3.5 3.5"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 4"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  };
  const LOGO =
    '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="4" y="4" width="26" height="26" rx="7" fill="var(--r2)"/><rect x="34" y="4" width="26" height="26" rx="7" fill="var(--r4)"/><rect x="4" y="34" width="26" height="26" rx="7" fill="var(--r5)"/><rect x="34" y="34" width="26" height="26" rx="13" fill="var(--r6)"/></svg>';

  const root = document.getElementById('app');
  const states = {};
  let current = null; // {def, index, inst, host}

  DP.setSpeed(DP.store.get('speed', 1));

  // ------------------------------------------------------------------ iskelet
  const crumb = h('div', { class: 'crumb' });
  const tools = h('div', { class: 'tools' });
  const header = h(
    'header',
    { class: 'topbar' },
    h('a', { class: 'brand', href: '#/', title: 'Ana sayfa · tüm kalıplar' }, h('span', { class: 'brand-logo', html: LOGO }), h('span', { class: 'brand-text' }, h('b', null, 'Tasarım Kalıpları Atölyesi'), h('small', null, 'Yazılım Tasarımı ve Mimarisi'))),
    crumb,
    tools
  );
  const tabs = h('div', { class: 'sb-tabs', role: 'tablist' });
  const btnPrevScene = h('button', { class: 'sb-nav', type: 'button', title: 'Önceki sahne', html: ICON.prev });
  const btnNextScene = h('button', { class: 'sb-nav', type: 'button', title: 'Sonraki sahne', html: ICON.next });
  const progress = h('div', { class: 'sb-progress' }, h('span'));
  const scenebar = h('nav', { class: 'scenebar', 'aria-label': 'Sahneler' }, btnPrevScene, tabs, btnNextScene, progress);
  const main = h('main', { class: 'main', id: 'main' });
  root.append(header, scenebar, main);

  btnPrevScene.addEventListener('click', () => current && goIndex(current.index - 1));
  btnNextScene.addEventListener('click', () => current && goIndex(current.index + 1));

  function tool(icon, title, fn, cls) {
    const b = h('button', { class: 'tool ' + (cls || ''), type: 'button', title, 'aria-label': title, html: ICON[icon] });
    b.addEventListener('click', fn);
    tools.appendChild(b);
    return b;
  }
  tool('zoomOut', 'Yazıyı küçült (−)', () => zoom(-0.1));
  tool('zoomIn', 'Yazıyı büyüt (+)', () => zoom(0.1));
  const themeBtn = tool('moon', 'Tema değiştir (T)', () => toggleTheme());
  const penBtn = tool('pen', 'Ekrana çiz (K) · temizle (X)', () => DP.fx.pen.toggle());
  tool('full', 'Tam ekran (F)', () => toggleFullscreen());
  tool('help', 'Kısayollar (?)', () => toggleHelp());
  DP.on('pen', (on) => penBtn.classList.toggle('is-on', on));

  // ------------------------------------------------------------------ tema / yakınlaştırma / tam ekran
  function syncThemeIcon() {
    themeBtn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? ICON.sun : ICON.moon;
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    DP.store.set('theme', next);
    syncThemeIcon();
  }
  syncThemeIcon();

  function zoom(delta, reset) {
    const cur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1;
    const v = reset ? 1 : Math.round(Math.min(1.7, Math.max(0.7, cur + delta)) * 10) / 10;
    document.documentElement.style.setProperty('--scale', String(v));
    DP.store.set('scale', v);
    DP.fx.toast('Yazı boyutu: %' + Math.round(v * 100), 1000);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }

  // ------------------------------------------------------------------ yardım penceresi
  let helpEl = null;
  function toggleHelp(force) {
    const open = force != null ? force : !helpEl;
    if (!open) {
      if (helpEl) helpEl.remove();
      helpEl = null;
      return;
    }
    if (helpEl) return;
    const rows = [
      ['→ · Boşluk · PgDn', 'Sonraki adım (adımlar bitince sonraki sahne)'],
      ['← · PgUp', 'Önceki adım / önceki sahne'],
      ['Home · End', 'Sahnenin ilk / son adımı'],
      ['P', 'Otomatik oynat / durdur'],
      ['1 – 9', 'Sahneye doğrudan atla'],
      ['F', 'Tam ekran'],
      ['T', 'Açık / koyu tema'],
      ['+ · − · 0', 'Yazı boyutu (projeksiyon için)'],
      ['K · X', 'Ekrana çizim kalemi · çizimleri temizle'],
      ['?', 'Bu pencere'],
    ];
    helpEl = h(
      'div',
      { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Klavye kısayolları' },
      h(
        'div',
        { class: 'modal-card' },
        h('div', { class: 'modal-head' }, h('h2', null, 'Klavye kısayolları'), h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => toggleHelp(false) }, 'Kapat')),
        h('div', { class: 'keys' }, rows.map(([k, d]) => h('div', { class: 'key-row' }, h('span', { class: 'key-k' }, k.split(' · ').map((x, i) => [i ? ' · ' : '', h('kbd', null, x)])), h('span', null, d)))),
        h(
          'div',
          { class: 'modal-tips' },
          h('b', null, 'Sunum ipuçları: '),
          'Sunum kumandası (clicker) genellikle PgDn/PgUp gönderir; doğrudan çalışır. Projeksiyonda yazılar küçük kalırsa + tuşuyla büyütün, Canlı Akış’ta “Kod paneli”ni gizleyerek sahneyi genişletin.'
        )
      )
    );
    helpEl.addEventListener('click', (e) => e.target === helpEl && toggleHelp(false));
    document.body.appendChild(helpEl);
  }

  // ------------------------------------------------------------------ yönlendirme
  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    return { pattern: parts[0] || null, scene: parts[1] || null };
  }

  function route() {
    const r = parseHash();
    const def = r.pattern && DP.patterns[r.pattern];
    if (!def) {
      showHome();
      return;
    }
    const idx = Math.max(0, def.scenes.findIndex((s) => s.id === r.scene));
    showScene(def, idx);
  }

  function unmount() {
    if (current && current.inst && current.inst.destroy) {
      try {
        current.inst.destroy();
      } catch (e) {
        console.error(e);
      }
    }
    if (DP.fx.pen.on) DP.fx.pen.toggle(false);
    DP.fx.pen.clear();
    main.innerHTML = '';
  }

  // ------------------------------------------------------------------ ana sayfa
  function showHome() {
    unmount();
    current = null;
    root.classList.remove('is-pattern');
    crumb.innerHTML = '';
    document.title = 'Tasarım Kalıpları Atölyesi';
    const readyCount = DP.catalog.filter((p) => p.ready && DP.patterns[p.id]).length;
    const home = h('div', { class: 'home' });
    home.innerHTML = `
      <section class="home-hero">
        <div class="home-hero-text">
          <div class="eyebrow">Yazılım Tasarımı ve Mimarisi · interaktif ders materyali</div>
          <h1>Tasarım kalıplarını <span class="grad">izleyerek</span> öğrenin</h1>
          <p>Her kalıp bir hikâye gibi anlatılır: <b>sorun → çözüm → UML yapısı → canlı akış → genişletme → quiz</b>.
          Animasyon adım adım ilerlerken ilgili <b>Java</b> satırı aynı anda vurgulanır.</p>
          <div class="home-cta">
            <a class="btn btn-primary btn-lg" href="#/factory-method">▶ Factory Method ile başla</a>
            <button class="btn btn-ghost btn-lg" type="button" data-help>⌨ Klavye kısayolları</button>
          </div>
          <div class="home-stats"><span><b>${readyCount}</b> / ${DP.catalog.length} kalıp hazır</span><span>İnternet gerektirmez</span><span>Java 17+ örnek kodlar</span></div>
        </div>
        <div class="home-hero-art" aria-hidden="true">${heroArt()}</div>
      </section>
      ${DP.categories
        .map(
          (c) => `
        <section class="cat">
          <div class="cat-head"><h2>${c.title} <span>${c.en}</span></h2><p>${c.desc}</p></div>
          <div class="cards">
            ${DP.catalog
              .filter((p) => p.cat === c.id)
              .map((p) => {
                const ready = p.ready && DP.patterns[p.id];
                return `<${ready ? `a href="#/${p.id}"` : 'div'} class="pcard ${ready ? 'is-ready' : 'is-soon'}">
                  <div class="pcard-top"><span class="pcard-name">${p.name}</span><span class="badge ${ready ? 'ok' : ''}">${ready ? 'Hazır' : 'Yakında'}</span></div>
                  <div class="pcard-tr">${p.tr}</div>
                  <p>${p.intent}</p>
                  ${ready ? `<div class="pcard-foot">${DP.patterns[p.id].scenes.length} sahne · animasyon · Java · quiz</div>` : ''}
                </${ready ? 'a' : 'div'}>`;
              })
              .join('')}
          </div>
        </section>`
        )
        .join('')}
      <section class="how">
        <h2>Derste nasıl kullanılır?</h2>
        <div class="how-grid">
          <div class="how-card"><b>1 · Projeksiyona yansıtın</b><span><kbd>F</kbd> ile tam ekran, <kbd>+</kbd> ile yazıyı büyütün.</span></div>
          <div class="how-card"><b>2 · Adım adım ilerleyin</b><span><kbd>→</kbd> her basışta bir adım; sahne bitince sonrakine geçer.</span></div>
          <div class="how-card"><b>3 · Tahta gibi kullanın</b><span><kbd>K</kbd> kalemiyle ekrana çizin, <kbd>X</kbd> ile silin.</span></div>
          <div class="how-card"><b>4 · Sınıfı katın</b><span>Genişlet ve Quiz sahnelerinde cevapları sınıfla birlikte verin.</span></div>
        </div>
      </section>
      <footer class="home-foot">Çalıştırılabilir Java kodları proje içindeki <code>java/</code> klasöründedir.</footer>`;
    main.appendChild(home);
    home.querySelector('[data-help]').addEventListener('click', () => toggleHelp(true));
  }

  function heroArt() {
    return `
      <svg viewBox="0 0 430 290">
        <g class="ha-box rc rc-2" transform="translate(20,30)"><rect width="190" height="48" rx="10"/><text x="95" y="30" text-anchor="middle">Creator</text></g>
        <g class="ha-box rc rc-4" transform="translate(255,30)"><rect width="150" height="48" rx="10"/><text x="75" y="30" text-anchor="middle">Product</text></g>
        <g class="ha-box rc rc-3" transform="translate(20,222)"><rect width="190" height="48" rx="10"/><text x="95" y="30" text-anchor="middle">ConcreteCreator</text></g>
        <g class="ha-box rc rc-5" transform="translate(255,222)"><rect width="165" height="48" rx="10"/><text x="82" y="30" text-anchor="middle">ConcreteProduct</text></g>
        <path class="ha-inh" d="M115 222 V96"/><polygon class="ha-tri" points="115,80 106,96 124,96"/>
        <path class="ha-inh is-dashed" d="M330 222 V96"/><polygon class="ha-tri" points="330,80 321,96 339,96"/>
        <path class="ha-create" d="M210 246 H244"/><polyline class="ha-open" points="238,240 250,246 238,252"/>
        <text class="ha-label" x="128" y="158">factoryMethod()</text>
        <circle class="ha-token" r="8"><animateMotion dur="3s" repeatCount="indefinite" keyPoints="0;0.62;1" keyTimes="0;0.6;1" calcMode="linear" path="M115 96 V246 H250"/></circle>
      </svg>`;
  }

  // ------------------------------------------------------------------ kalıp sahneleri
  function showScene(def, index) {
    if (!states[def.id]) states[def.id] = def.initialState ? def.initialState() : {};
    const same = current && current.def === def && current.index === index;
    if (same) return;
    unmount();
    root.classList.add('is-pattern');
    const scene = def.scenes[index];
    crumb.innerHTML = '';
    crumb.append(
      h('a', { class: 'crumb-home', href: '#/', html: ICON.home + '<span>Kalıplar</span>' }),
      h('span', { class: 'crumb-sep' }, '/'),
      h('span', { class: 'crumb-name' }, def.name, h('small', null, def.tr))
    );
    renderTabs(def, index);
    document.title = `${scene.title} · ${def.name} — Tasarım Kalıpları Atölyesi`;

    const host = h('div', { class: 'scene-host' });
    main.appendChild(host);
    const ctx = {
      pattern: def,
      state: states[def.id],
      goScene: (id) => (location.hash = `#/${def.id}/${id}`),
      flashScene: (id) => {
        const t = tabs.querySelector(`[data-scene="${id}"]`);
        if (t) DP.flash(t, 'is-flash');
      },
    };
    current = { def, index, inst: null, host };
    try {
      current.inst = scene.mount(host, ctx) || {};
    } catch (e) {
      console.error(e);
      host.appendChild(h('div', { class: 'error-box' }, 'Sahne yüklenemedi: ' + e.message));
      current.inst = {};
    }
    if (pendingLast) {
      pendingLast = false;
      if (current.inst.last) current.inst.last();
    }
  }

  function renderTabs(def, index) {
    tabs.innerHTML = '';
    def.scenes.forEach((s, i) => {
      const a = h(
        'a',
        {
          class: 'sb-tab' + (i === index ? ' is-active' : '') + (i < index ? ' is-past' : '') + (s.star ? ' is-star' : ''),
          href: `#/${def.id}/${s.id}`,
          role: 'tab',
          'aria-selected': String(i === index),
          'data-scene': s.id,
        },
        h('span', { class: 'sb-num' }, String(i + 1)),
        h('span', { class: 'sb-title' }, s.title)
      );
      tabs.appendChild(a);
    });
    const active = tabs.children[index];
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center' });
    progress.firstChild.style.width = ((index + 1) / def.scenes.length) * 100 + '%';
    btnPrevScene.disabled = index === 0;
    btnNextScene.disabled = index === def.scenes.length - 1;
  }

  // Önceki sahneye "geri" gelindiğinde o sahnenin son adımından devam edilir.
  let pendingLast = false;

  function goIndex(i, atEnd) {
    if (!current) return;
    const def = current.def;
    if (i < 0 || i >= def.scenes.length) return;
    pendingLast = !!atEnd;
    location.hash = `#/${def.id}/${def.scenes[i].id}`;
  }

  function next() {
    if (!current) return;
    if (current.inst && current.inst.next && current.inst.next()) return;
    goIndex(current.index + 1);
  }

  function prev() {
    if (!current) return;
    if (current.inst && current.inst.prev && current.inst.prev()) return;
    goIndex(current.index - 1, true);
  }

  // ------------------------------------------------------------------ klavye
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
    const k = e.key;
    if (helpEl) {
      if (k === 'Escape' || k === '?') toggleHelp(false);
      return;
    }
    switch (k) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        next();
        break;
      case ' ':
        if (t && t.closest && t.closest('button, a, [role="button"]')) return;
        e.preventDefault();
        next();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prev();
        break;
      case 'Home':
        if (current && current.inst && current.inst.first) {
          e.preventDefault();
          current.inst.first();
        }
        break;
      case 'End':
        if (current && current.inst && current.inst.last) {
          e.preventDefault();
          current.inst.last();
        }
        break;
      case 'p':
      case 'P':
        if (current && current.inst && current.inst.play) current.inst.play();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 't':
      case 'T':
        toggleTheme();
        break;
      case 'k':
      case 'K':
        DP.fx.pen.toggle();
        break;
      case 'x':
      case 'X':
        DP.fx.pen.clear();
        break;
      case '+':
      case '=':
        zoom(0.1);
        break;
      case '-':
      case '_':
        zoom(-0.1);
        break;
      case '0':
        zoom(0, true);
        break;
      case '?':
      case 'h':
      case 'H':
        toggleHelp(true);
        break;
      case 'Escape':
        if (DP.fx.pen.on) DP.fx.pen.toggle(false);
        break;
      default:
        if (/^[1-9]$/.test(k) && current) goIndex(Number(k) - 1);
    }
  });

  DP.on('scene:next', () => current && goIndex(current.index + 1));
  window.addEventListener('hashchange', route);
  DP.app = { route, next, prev, toggleTheme, zoom };
  route();
})();
