/*
 * Abstract Factory — "Canlı Akış" sahnesinin animasyonlu SVG dünyası.
 *
 * Metafor:
 *   Main kartı        → ailenin seçildiği tek yer (new KaraFabrikasi())
 *   Ofis              → TeslimatServisi nesnesi (istemci); fabrikayı ALAN olarak tutar (kompozisyon)
 *   Fabrika binası    → somut fabrika nesnesi; iki üretim hattı: araç hattı (ürün A), belge hattı (ürün B)
 *   Gümrük kulübesi   → araç ile belge aynı aileden mi? (Gumruk.kontrolEt)
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const AF = DP.af;
  const L = DP.lojistik;
  const art = L.art;
  let uidCounter = 0;

  const DOC_SCALE = 0.64; // araca takılan belgenin ölçeği
  const ORDER_HOME = 'translate(112px,300px) scale(.6)';
  const ORDER_AT = { arac: 'translate(354px,336px) scale(1)', belge: 'translate(354px,190px) scale(1)' };

  class AFStage {
    /** o: {family} */
    constructor(root, o) {
      this.uid = 'afs' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage af-stage is-blueprint no-office' });
      root.appendChild(this.el);
      this.el.innerHTML = this._markup();
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.cancel = null;
      this.flyTimer = 0;
      this.state = null;
      this.setFamily(o.family, false);
    }

    _markup() {
      const u = this.uid;
      const windows = [0, 1, 2]
        .map((c) => [0, 1].map((r) => `<rect class="o-win" x="${36 + c * 52}" y="${286 + r * 30}" width="36" height="22" rx="3"/>`).join(''))
        .join('');
      return `
<svg class="fm-svg" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Abstract Factory animasyon sahnesi">
  ${L.world(u)}

  <!-- Main: ailenin seçildiği yapılandırma noktası -->
  <g class="af-main" data-k="main">
    <rect class="am-box" x="16" y="14" width="212" height="76" rx="10"/>
    <text class="am-title" x="30" y="36">Main · yapılandırma</text>
    <text class="am-line" x="30" y="58" data-k="main-line">main() başlıyor…</text>
    <text class="am-fac" x="30" y="78" data-k="main-fac">KaraFabrikasi()</text>
    <circle class="am-dot" data-k="main-dot" cx="214" cy="73" r="6"/>
  </g>
  <g class="mref" data-k="mref"><path d="M220 73 C 244 73, 246 67, 264 67" marker-end="url(#${u}-arrow2)"/></g>

  <!-- İstemci: TeslimatServisi nesnesi -->
  <g class="af-office" data-k="office">
    <text class="o-sign" x="112" y="254" text-anchor="middle">servis : TeslimatServisi</text>
    <rect class="o-roof" x="18" y="262" width="188" height="14" rx="4"/>
    <rect class="o-wall" x="24" y="272" width="176" height="158" rx="4"/>
    ${windows}
    <g class="o-field"><rect x="34" y="346" width="156" height="28" rx="7"/><text x="45" y="365">fabrika</text><circle cx="176" cy="360" r="6"/></g>
    <rect class="o-door" x="94" y="384" width="36" height="46" rx="3"/>
    <text class="bp-label small" x="112" y="410" text-anchor="middle">henüz nesne yok</text>
  </g>
  <g class="cref" data-k="cref"><path d="M182 360 C 212 360, 214 330, 236 330" marker-end="url(#${u}-arrow2)"/></g>

  <!-- Somut fabrika nesnesi: iki üretim hattı -->
  <g class="factory af-factory" data-k="factory">
    <rect class="f-chimney" x="530" y="46" width="26" height="60" rx="2"/>
    <g class="smoke" data-k="smoke">
      <circle class="p1" cx="543" cy="38" r="9"/><circle class="p2" cx="550" cy="22" r="11"/><circle class="p3" cx="540" cy="4" r="13"/>
    </g>
    <path class="f-roof" d="M240 120 V100 L357 86 V100 L473 86 V100 L590 86 V120 Z"/>
    <text class="f-iface" x="415" y="114" text-anchor="middle">implements LojistikFabrikasi</text>
    <g class="f-sign">
      <path class="f-post" d="M300 84 V97 M470 84 V97"/>
      <rect x="268" y="50" width="234" height="34" rx="8"/>
      <text x="385" y="72" text-anchor="middle" data-k="sign-text">fabrika : KaraFabrikasi</text>
    </g>

    <g class="f-floor af-line" data-k="top">
      <rect class="f-wall" x="240" y="118" width="350" height="144"/>
      <text class="f-title" x="256" y="143">Belge hattı</text>
      <text class="f-caption" x="256" y="161">ürün B · TasimaBelgesi</text>
      <g class="chip is-impl" data-k="chip-belge"><rect x="256" y="174" width="196" height="32" rx="8"/><text x="268" y="195">belgeOlustur()</text></g>
      <text class="f-code" x="262" y="236"><tspan class="kw">return new </tspan><tspan class="prod" data-k="code-belge">CmrBelgesi</tspan><tspan>();</tspan></text>
      <g transform="translate(506,180)"><g class="printer" data-k="printer">${art.printer()}</g></g>
      <rect class="f-slot" x="582" y="194" width="9" height="22" rx="2"/>
    </g>

    <g class="f-floor af-line" data-k="bottom">
      <rect class="f-wall" x="240" y="262" width="350" height="168"/>
      <text class="f-title" x="256" y="288">Araç hattı</text>
      <text class="f-caption" x="256" y="306">ürün A · TasimaAraci</text>
      <g class="chip is-impl" data-k="chip-arac"><rect x="256" y="320" width="196" height="32" rx="8"/><text x="268" y="341">aracOlustur()</text></g>
      <text class="f-code" x="262" y="380"><tspan class="kw">return new </tspan><tspan class="prod" data-k="code-arac">Kamyon</tspan><tspan>();</tspan></text>
      <g transform="translate(500,334)"><g class="gear" data-k="gear"><circle class="g-teeth" r="24"/><circle class="g-body" r="17"/><circle class="g-hole" r="6"/></g></g>
      <rect class="f-door" x="544" y="356" width="46" height="74" rx="3"/>
    </g>
    <path class="chute" d="M592 208 L 666 318"/>
    <text class="bp-label" x="415" y="300" text-anchor="middle">henüz nesne yok</text>
    <text class="bp-label small" x="415" y="324" text-anchor="middle">(yalnızca sınıf tanımı)</text>
  </g>

  ${L.belt()}

  <!-- gümrük -->
  <g transform="translate(800,430)"><g class="customs" data-k="customs">${art.customs()}</g></g>

  <!-- sipariş zarfı: istemciden fabrikanın ilgili hattına -->
  <g class="order" data-k="order">${art.envelope()}<text y="31" text-anchor="middle" data-k="order-text">aracOlustur()</text></g>

  <!-- ürün A (araç) + üzerine takılan ürün B (belge) -->
  ${L.vehicle(`<g class="doc-att" data-k="doc-att" transform="translate(146,-112) scale(${DOC_SCALE})">${art.doc('att')}</g>`)}

  <!-- yazıcıdan çıkan belge (araçla buluşmadan önce) -->
  <g class="doc-free" data-k="doc-free">${art.doc('free')}</g>

  <!-- konuşma balonları -->
  <foreignObject class="bubble-fo" data-k="b-main" x="14" y="96" width="270" height="96"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-top"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-office" x="14" y="150" width="250" height="90"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-top" x="604" y="112" width="240" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-bottom" x="604" y="262" width="240" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-dest" x="700" y="228" width="290" height="96"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom is-ok"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-check" x="604" y="96" width="386" height="128"><div xmlns="http://www.w3.org/1999/xhtml" class="check-card"></div></foreignObject>
</svg>`;
    }

    setFamily(f, animate) {
      const k = this.k;
      this.f = f;
      k['sign-text'].textContent = 'fabrika : ' + f.factory;
      k['main-fac'].textContent = f.factory + '()';
      k['code-arac'].textContent = f.vehicle;
      k['code-belge'].textContent = f.doc;
      L.setTag(k, 'arac : ' + f.vehicle);
      L.applyKind(k, f.kind);
      ['att-name', 'free-name'].forEach((key) => {
        const t = k[key];
        t.textContent = f.docName;
        if (f.docName.length > 5) {
          t.setAttribute('textLength', '48');
          t.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        } else {
          t.removeAttribute('textLength');
          t.removeAttribute('lengthAdjust');
        }
      });
      this.tagW = Math.ceil(('arac : ' + f.vehicle).length * 8.6 + 26);
      k['doc-att'].setAttribute('transform', `translate(${this.tagW + 6},-112) scale(${DOC_SCALE})`);
      if (animate && this.state) DP.flash(k.factory, 'is-family-swap');
      if (this.state) {
        this._renderVehicle(this.state, null, false);
        this._renderCheck(this.state.check);
      }
    }

    /** Tüm sahneyi verilen duruma getirir. */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      this.state = st;
      const tog = (key, cls, on) => k[key] && k[key].classList.toggle(cls, !!on);

      this.el.classList.toggle('is-blueprint', !st.factory);
      this.el.classList.toggle('no-office', !st.office);
      if (st.factory && !prev.factory && anim) DP.flash(k.factory, 'is-popping');
      if (st.office && !prev.office && anim) DP.flash(k.office, 'is-popping');

      tog('main', 'is-active', st.main);
      k['main-line'].textContent = st.mainLine ? 'fabrika = new' : 'main() başlıyor…';
      tog('main-fac', 'is-on', st.mainLine);
      tog('main-dot', 'is-on', st.mainLine);
      tog('mref', 'is-on', st.mref);
      tog('office', 'is-active', st.officeActive);
      tog('cref', 'is-on', st.cref);
      tog('top', 'is-active', st.top);
      tog('bottom', 'is-active', st.bottom);
      tog('chip-arac', 'is-active', st.chipArac);
      tog('chip-belge', 'is-active', st.chipBelge);
      tog('gear', 'is-spinning', st.gear);
      tog('printer', 'is-printing', st.printer);
      tog('smoke', 'is-on', st.smoke);
      tog('belt', 'is-running', st.gear || st.vehicle === 'delivering');
      tog('lamp', 'is-green', st.gate === 'ok');
      tog('lamp', 'is-red', st.gate === 'bad');
      ['truck', 'ship', 'plane'].forEach((kind) => tog('dest-' + kind, 'is-done', st.done));

      this._renderOrder(st, prev, anim);
      this._renderVehicle(st, prev, anim);
      this._renderDoc(st, prev, anim);
      this._renderBubble(st.bubble);
      this._renderCheck(st.check);
    }

    _renderOrder(st, prev, anim) {
      const ord = this.k.order;
      ord.classList.toggle('is-on', !!st.order);
      if (st.order) this.k['order-text'].textContent = st.order === 'arac' ? 'aracOlustur()' : 'belgeOlustur()';
      const target = st.order ? ORDER_AT[st.order] : ORDER_HOME;
      if (st.order && st.order !== prev.order && anim) {
        ord.style.transition = 'none';
        ord.style.transform = ORDER_HOME;
        void ord.getBoundingClientRect();
        ord.style.transition = '';
      }
      ord.style.transform = target;
    }

    _renderVehicle(st, prev, anim) {
      const k = this.k;
      if (this.cancel) {
        this.cancel();
        this.cancel = null;
      }
      const show = st.vehicle && st.vehicle !== 'none';
      k.veh.classList.toggle('is-on', !!show);
      k['veh-tag'].classList.toggle('is-done', st.vehicle === 'delivered');
      if (!show) return;
      const kind = this.f.kind;
      if (st.vehicle === 'built') {
        L.placeVehicle(k.veh, kind, 0);
        if (anim && prev && (!prev.vehicle || prev.vehicle === 'none')) DP.flash(k['veh-inner'], 'is-building');
      } else if (st.vehicle === 'delivering' && anim && prev && prev.vehicle === 'built') {
        L.placeVehicle(k.veh, kind, 0);
        this.cancel = DP.tween({
          duration: DP.dur(2700),
          ease: DP.ease.inOut,
          update: (t) => L.placeVehicle(k.veh, kind, t),
          done: () => (this.cancel = null),
        });
      } else {
        L.placeVehicle(k.veh, kind, 1);
      }
    }

    /** Belge: yazıcıda basılır → kaydıraktan inip araca takılır → gümrükte damgalanır. */
    _renderDoc(st, prev, anim) {
      const free = this.k['doc-free'];
      const att = this.k['doc-att'];
      const d = st.doc || 'none';
      const onVehicle = d === 'attached' || d === 'stamped';
      clearTimeout(this.flyTimer);
      free.classList.remove('is-flying');
      att.classList.toggle('is-on', onVehicle);
      att.classList.toggle('is-stamped', d === 'stamped');
      free.classList.toggle('is-on', d === 'printed');
      if (d === 'printed') {
        if (anim && prev.doc !== 'printed') {
          free.style.transition = 'none';
          free.style.transform = 'translate(520px,186px) scale(.25)';
          void free.getBoundingClientRect();
          free.style.transition = '';
        }
        free.style.transform = 'translate(522px,118px) scale(.62)';
      } else if (onVehicle && anim && prev.doc === 'printed') {
        // aynı fabrikanın iki ürünü buluşuyor: belge kaydıraktan araca uçar
        free.classList.add('is-flying');
        free.style.transform = `translate(${598 + this.tagW + 6}px,${416 - 112}px) scale(${DOC_SCALE})`;
        DP.flash(att, 'is-arriving');
        this.flyTimer = setTimeout(() => free.classList.remove('is-flying'), DP.dur(950));
      }
      if (d === 'stamped' && prev.doc !== 'stamped' && anim) DP.flash(att, 'is-stamping');
    }

    _renderBubble(b) {
      ['main', 'office', 'top', 'bottom', 'dest'].forEach((at) => {
        const fo = this.k['b-' + at];
        const on = !!b && b.at === at;
        const div = fo.firstElementChild;
        if (on) {
          const html = DP.md(b.text, AF.roleOf);
          if (div.innerHTML !== html) {
            div.innerHTML = html;
            DP.flash(div, 'is-pop');
          }
        }
        fo.classList.toggle('is-on', on);
      });
    }

    _renderCheck(on) {
      const fo = this.k['b-check'];
      fo.classList.toggle('is-on', !!on);
      if (!on) return;
      const f = this.f;
      fo.firstElementChild.innerHTML = `
        <div class="cc-title">Gümrük kontrolü · <code>Gumruk.kontrolEt()</code></div>
        <div class="cc-row"><span>${f.vehicleTr} için gereken belge</span><b>${f.docName}</b></div>
        <div class="cc-row"><span>Gelen belge</span><b>${f.docName}</b></div>
        <div class="cc-verdict">✓ Onaylandı — ikisi de <b>${f.label}</b> ailesinden</div>`;
    }

    destroy() {
      if (this.cancel) this.cancel();
      clearTimeout(this.flyTimer);
      this.el.remove();
    }
  }

  AF.Stage = AFStage;
})();
