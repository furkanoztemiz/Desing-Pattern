/*
 * Factory Method — "Canlı Akış" sahnesinin animasyonlu SVG dünyası.
 *
 * Metafor: Nesne = fabrika binası.
 *   Üst kat  → Lojistik sınıfından miras gelen kod (teslimatPlanla, soyut aracOlustur)
 *   Alt kat  → Somut alt sınıfın override ettiği fabrika metodu (aracOlustur → new Kamyon())
 *   Bant     → Üretilen ürün; ardından ürün kendi yolundan (kara/deniz/hava) teslimat yapar.
 *
 * Durum tabanlı çizim: render(state, prevState, {animate}) — geri/ileri adımlarda tutarlı.
 */
(function () {
  'use strict';
  const FM = DP.fm;
  const L = DP.lojistik;
  const art = (FM.art = L.art); // sahneler de aynı çizimleri kullanır
  let uidCounter = 0;

  class FMStage {
    /** o: {variant, cargo} */
    constructor(root, o) {
      this.uid = 'fms' + ++uidCounter;
      this.el = DP.h('div', { class: 'fm-stage is-blueprint' });
      root.appendChild(this.el);
      this.el.innerHTML = this._markup();
      this.k = {};
      DP.$$('[data-k]', this.el).forEach((n) => (this.k[n.getAttribute('data-k')] = n));
      this.cancel = null;
      this.state = null;
      this.setVariant(o.variant, false);
    }

    _markup() {
      const u = this.uid;
      return `
<svg class="fm-svg" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Factory Method animasyon sahnesi">
  ${L.world(u)}

  <!-- istemci -->
  <g class="client" data-k="client">
    <rect class="mon" x="30" y="104" width="160" height="102" rx="10"/>
    <rect class="scr" x="40" y="114" width="140" height="82" rx="4"/>
    <text class="scr-t" x="50" y="134">main() {</text>
    <rect class="scr-l l1" x="62" y="144" width="96" height="7" rx="3"/>
    <rect class="scr-l l2" x="62" y="157" width="70" height="7" rx="3"/>
    <rect class="scr-l l3" x="62" y="170" width="84" height="7" rx="3"/>
    <text class="scr-t" x="50" y="190">}</text>
    <rect class="stand" x="100" y="206" width="20" height="18"/>
    <rect class="base" x="78" y="224" width="64" height="7" rx="3"/>
    <text class="client-label" x="110" y="254" text-anchor="middle">İstemci (Main)</text>
  </g>
  <g class="var" data-k="var">
    <rect class="var-box" x="26" y="282" width="168" height="72" rx="10"/>
    <text class="var-type" x="40" y="309">Lojistik</text>
    <text class="var-name" x="40" y="336">lojistik</text>
    <circle class="var-dot" cx="180" cy="318" r="6"/>
    <text class="var-cap" x="110" y="374" text-anchor="middle">referans değişken</text>
  </g>
  <g class="ref" data-k="ref">
    <path d="M186 318 C 218 318, 210 236, 233 236" marker-end="url(#${u}-arrow2)"/>
  </g>

  <!-- fabrika = nesne -->
  <g class="factory" data-k="factory">
    <rect class="f-chimney" x="530" y="46" width="26" height="60" rx="2"/>
    <g class="smoke" data-k="smoke">
      <circle class="p1" cx="543" cy="38" r="9"/><circle class="p2" cx="550" cy="22" r="11"/><circle class="p3" cx="540" cy="4" r="13"/>
    </g>
    <path class="f-roof" d="M240 120 V100 L357 86 V100 L473 86 V100 L590 86 V120 Z"/>
    <g class="f-sign">
      <path class="f-post" d="M300 84 V97 M470 84 V97"/>
      <rect x="268" y="50" width="234" height="34" rx="8"/>
      <text x="385" y="72" text-anchor="middle" data-k="sign-text">lojistik : KaraLojistigi</text>
    </g>

    <g class="f-floor f-top" data-k="top">
      <rect class="f-wall" x="240" y="118" width="350" height="144"/>
      <text class="f-title" x="256" y="143">Lojistik</text>
      <text class="f-caption" x="256" y="161">«abstract» · tüm alt sınıflarda ortak</text>
      <g class="chip" data-k="chip-plan"><rect x="256" y="174" width="196" height="32" rx="8"/><text x="268" y="195">teslimatPlanla(yuk)</text></g>
      <g class="chip is-abstract" data-k="chip-abs"><rect x="256" y="216" width="196" height="32" rx="8"/><text x="268" y="237">aracOlustur()</text><text class="chip-tag" x="442" y="236" text-anchor="end">soyut</text></g>
      <g class="clip" data-k="clip" transform="translate(500,178)">${art.clipboard()}</g>
      <g class="lens" data-k="lens">
        <rect x="466" y="172" width="112" height="78" rx="10"/>
        <text class="lens-var" x="522" y="195" text-anchor="middle">arac</text>
        <text class="lens-type" x="522" y="216" text-anchor="middle">TasimaAraci</text>
        <text class="lens-q" x="522" y="238" text-anchor="middle">somut tipi: ?</text>
      </g>
    </g>

    <g class="f-floor f-bottom" data-k="bottom">
      <rect class="f-wall" x="240" y="262" width="350" height="168"/>
      <g class="f-swap" data-k="swap">
        <text class="f-title" x="256" y="288" data-k="bt-title">KaraLojistigi</text>
        <text class="f-caption" x="256" y="306">alt sınıf · override eder</text>
        <g class="chip is-impl" data-k="chip-impl"><rect x="256" y="320" width="196" height="32" rx="8"/><text x="268" y="341">aracOlustur()</text></g>
        <text class="f-code" x="262" y="380"><tspan class="kw">return new </tspan><tspan class="prod" data-k="bt-prod">Kamyon</tspan><tspan>();</tspan></text>
      </g>
      <g transform="translate(500,334)"><g class="gear" data-k="gear"><circle class="g-teeth" r="24"/><circle class="g-body" r="17"/><circle class="g-hole" r="6"/></g></g>
      <rect class="f-door" x="544" y="356" width="46" height="74" rx="3"/>
    </g>
    <text class="bp-label" x="415" y="300" text-anchor="middle">henüz nesne yok</text>
    <text class="bp-label small" x="415" y="324" text-anchor="middle">(yalnızca sınıf tanımı)</text>
  </g>

  <g class="dispatch" data-k="dispatch">
    <path d="M440 250 V315" marker-end="url(#${u}-arrow)"/>
    <text x="450" y="292">polimorfizm</text>
  </g>

  <!-- bant -->
  ${L.belt()}

  <!-- çağrı okları -->
  <g class="call" data-k="call">
    <path d="M590 210 C 650 210, 668 290, 630 334" marker-end="url(#${u}-arrow)"/>
    <text x="640" y="222">teslimEt(yuk)</text>
  </g>
  <path class="lens-line" data-k="lens-line" d="M578 238 C 604 268, 616 300, 624 330"/>

  <!-- sipariş zarfı -->
  <g class="order" data-k="order">${art.envelope()}<text y="31" text-anchor="middle">teslimatPlanla()</text></g>

  <!-- ürün -->
  ${L.vehicle()}

  <!-- konuşma balonları -->
  <foreignObject class="bubble-fo" data-k="b-top" x="604" y="116" width="240" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-bottom" x="604" y="250" width="240" height="120"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-left"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-client" x="14" y="4" width="250" height="96"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom"></div></foreignObject>
  <foreignObject class="bubble-fo" data-k="b-dest" x="700" y="228" width="290" height="96"><div xmlns="http://www.w3.org/1999/xhtml" class="bubble tail-bottom is-ok"></div></foreignObject>
</svg>`;
    }

    setVariant(v, animate) {
      const k = this.k;
      const apply = () => {
        k['sign-text'].textContent = 'lojistik : ' + v.creator;
        k['bt-title'].textContent = v.creator;
        k['bt-prod'].textContent = v.product;
        L.setTag(k, 'arac : ' + v.product);
        L.applyKind(k, v.vehicle);
      };
      this.v = v;
      // Metinler hemen güncellenir; alt kattaki "dönme" yalnızca görsel animasyon.
      apply();
      if (animate && this.state) DP.flash(k.swap, 'is-swapping');
      if (this.state) this._renderVehicle(this.state, null, false);
    }

    /** Tüm sahneyi verilen duruma getirir. */
    render(st, prev, o) {
      const k = this.k;
      const anim = !!(o && o.animate);
      prev = prev || {};
      this.state = st;
      const tog = (key, cls, on) => k[key] && k[key].classList.toggle(cls, !!on);

      this.el.classList.toggle('is-blueprint', !st.factory);
      if (st.factory && !prev.factory && anim) DP.flash(k.factory, 'is-popping');
      tog('client', 'is-active', st.client);
      tog('var', 'is-on', st.ref);
      tog('ref', 'is-on', st.ref);
      tog('top', 'is-active', st.top);
      tog('bottom', 'is-active', st.bottom);
      tog('chip-plan', 'is-active', st.plan);
      tog('chip-abs', 'is-pulse', st.abs);
      tog('chip-impl', 'is-active', st.impl);
      tog('dispatch', 'is-on', st.dispatch);
      tog('gear', 'is-spinning', st.gear);
      tog('smoke', 'is-on', st.smoke);
      tog('lens', 'is-on', st.lens);
      tog('clip', 'is-off', st.lens);
      tog('lens-line', 'is-on', st.lensLine);
      tog('call', 'is-on', st.call);
      tog('belt', 'is-running', st.gear || st.product === 'delivering');
      ['truck', 'ship', 'plane'].forEach((kind) => tog('dest-' + kind, 'is-done', st.done));

      // sipariş zarfı: istemciden fabrikanın üst katına uçar
      const ord = k.order;
      ord.classList.toggle('is-on', !!st.order);
      if (st.order && !prev.order && anim) {
        ord.style.transition = 'none';
        ord.style.transform = 'translate(150px,160px) scale(.6)';
        void ord.getBoundingClientRect();
        ord.style.transition = '';
        ord.style.transform = 'translate(354px,190px) scale(1)';
      } else {
        ord.style.transform = st.order ? 'translate(354px,190px) scale(1)' : 'translate(150px,160px) scale(.6)';
      }

      this._renderVehicle(st, prev, anim);
      this._renderBubble(st.bubble);
    }

    _place(t) {
      L.placeVehicle(this.k.veh, this.v.vehicle, t);
    }

    _renderVehicle(st, prev, anim) {
      const k = this.k;
      if (this.cancel) {
        this.cancel();
        this.cancel = null;
      }
      const show = st.product && st.product !== 'none';
      k.veh.classList.toggle('is-on', !!show);
      k['veh-tag'].classList.toggle('is-done', st.product === 'delivered');
      if (!show) return;
      if (st.product === 'built') {
        this._place(0);
        if (anim && prev && (!prev.product || prev.product === 'none')) DP.flash(k['veh-inner'], 'is-building');
      } else if (st.product === 'delivering' && anim && prev && prev.product === 'built') {
        this._place(0);
        this.cancel = DP.tween({
          duration: DP.dur(2700),
          ease: DP.ease.inOut,
          update: (t) => this._place(t),
          done: () => (this.cancel = null),
        });
      } else {
        this._place(1);
      }
    }

    _renderBubble(b) {
      ['top', 'bottom', 'client', 'dest'].forEach((at) => {
        const fo = this.k['b-' + at];
        const on = !!b && b.at === at;
        const div = fo.firstElementChild;
        if (on) {
          const html = DP.md(b.text, FM.roleOf);
          if (div.innerHTML !== html) {
            div.innerHTML = html;
            DP.flash(div, 'is-pop');
          }
        }
        fo.classList.toggle('is-on', on);
      });
    }

    destroy() {
      if (this.cancel) this.cancel();
      this.el.remove();
    }
  }

  FM.Stage = FMStage;
})();
