/*
 * Abstract Factory — matris bileşenleri
 *   FamilyMatrix : satır = aile (somut fabrika), sütun = ürün türü (soyut ürün), hücre = somut ürün.
 *                  "Aile eklemek kolay (satır), ürün türü eklemek zor (sütun)" fikrinin görseli.
 *   CompatMatrix : araç × belge uyumluluk tablosu ("Sorun" sahnesi: kaç kombinasyon mümkün, kaçı geçerli?)
 */
(function () {
  'use strict';
  const AF = DP.af;
  const { h } = DP;

  const COLS = {
    arac: { title: 'TasimaAraci', sub: 'araç · aracOlustur()', icon: 'truck' },
    belge: { title: 'TasimaBelgesi', sub: 'belge · belgeOlustur()', icon: 'doc' },
    sigorta: { title: 'TasimaSigortasi', sub: 'sigorta · sigortaOlustur()', icon: 'doc' },
  };

  const cls = (name) => `<span class="cls rc rc-${AF.roleOf(name) || 5}">${name}</span>`;

  /**
   * st: {rows:['kara','deniz',...], cols:['arac','belge',...],
   *      rowBadge:{kara:['YENİ','new']}, colBadge:{sigorta:['YENİ','new']},
   *      cell:{'kara:sigorta':'missing'|'default'|'new'}, focusRow, focusCol, newRow}
   */
  class FamilyMatrix {
    constructor(root) {
      this.el = h('div', { class: 'fam-matrix' });
      root.appendChild(this.el);
    }

    update(st) {
      const F = AF.families;
      const head = st.cols
        .map((c) => {
          const col = COLS[c];
          const badge = st.colBadge && st.colBadge[c];
          return `<th class="fx-col${st.focusCol === c ? ' is-focus' : ''}${badge ? ' is-' + badge[1] : ''}">
            ${DP.lojistik.art.icon(col.icon)} ${cls(col.title)}<small>${col.sub}</small>
            ${badge ? `<span class="fx-badge kind-${badge[1]}">${badge[0]}</span>` : ''}</th>`;
        })
        .join('');
      const rows = st.rows
        .map((k) => {
          const f = F[k];
          const badge = st.rowBadge && st.rowBadge[k];
          const pending = st.pendingRow === k;
          const cells = st.cols
            .map((c) => {
              const status = pending ? 'pending' : st.cell && st.cell[k + ':' + c];
              let inner;
              if (c === 'arac') inner = cls(f.vehicle);
              else if (c === 'belge') inner = cls(f.doc) + `<small>${f.docName}</small>`;
              else inner = '';
              if (status === 'pending') inner = '<span class="fx-pending">?</span>';
              else if (status === 'missing') inner = '<span class="fx-missing">✗ yok · derlenmez</span>';
              else if (status === 'default') inner = '<span class="fx-default">↳ StandartSigorta <small>(varsayılan)</small></span>';
              return `<td class="fx-cell${status ? ' is-' + status : ''}${st.focusCol === c ? ' is-colfocus' : ''}">${inner}</td>`;
            })
            .join('');
          return `<tr class="fx-row${st.focusRow === k ? ' is-focus' : ''}${st.newRow === k ? ' is-new' : ''}${pending ? ' is-pending' : ''}">
            <th class="fx-rowhead">${DP.lojistik.art.icon(f.kind)} ${pending ? `<span class="fx-pending-name">+ ${f.label} ailesi?</span>` : cls(f.factory)}<small>${pending ? 'genişleme yeri' : f.label + ' ailesi'}</small>
            ${badge ? `<span class="fx-badge kind-${badge[1]}">${badge[0]}</span>` : ''}</th>${cells}</tr>`;
        })
        .join('');
      this.el.innerHTML = `
        <table class="${st.cols.length > 2 ? 'is-wide' : ''}">
          <thead><tr><th class="fx-corner">Aile ↓ <span>·</span> Ürün türü →</th>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="fx-caption"><b>Satır</b> = bir aile (somut fabrika) · <b>Sütun</b> = bir ürün türü (soyut ürün) · <b>Hücre</b> = somut ürün</div>`;
    }
  }

  /**
   * Araç × belge uyumluluk tablosu.
   * st: {vehicles:['kara','deniz'], docs:['kara','deniz'], produced:[['kara','kara'],...], bad:['hava','kara'], reveal:true}
   */
  class CompatMatrix {
    constructor(root) {
      this.el = h('div', { class: 'compat' });
      root.appendChild(this.el);
    }

    update(st) {
      const F = AF.families;
      const has = (list, a, b) => (list || []).some(([x, y]) => x === a && y === b);
      const head = st.docs.map((d) => `<th>${DP.lojistik.art.icon('doc')} ${F[d].docName}</th>`).join('');
      const rows = st.vehicles
        .map((v) => {
          const cells = st.docs
            .map((d) => {
              const ok = v === d;
              const made = has(st.produced, v, d);
              const bad = st.bad && st.bad[0] === v && st.bad[1] === d;
              const sym = st.reveal || made || bad ? (ok ? '✓' : '✗') : '·';
              return `<td class="cp-cell ${ok ? 'is-ok' : 'is-bad'}${st.reveal ? ' is-revealed' : ''}${made ? ' is-made' : ''}${bad ? ' is-crash' : ''}">${sym}${bad ? '<small>gümrük!</small>' : made ? '<small>gönderildi</small>' : ''}</td>`;
            })
            .join('');
          return `<tr><th>${DP.lojistik.art.icon(F[v].kind)} ${F[v].vehicleTr}</th>${cells}</tr>`;
        })
        .join('');
      const total = st.vehicles.length * st.docs.length;
      const valid = st.vehicles.filter((v) => st.docs.includes(v)).length;
      this.el.innerHTML = `
        <table><thead><tr><th class="cp-corner">Araç ↓ · Belge →</th>${head}</tr></thead><tbody>${rows}</tbody></table>
        <div class="cp-sum"><b>${total}</b> olası eşleşme · yalnızca <b class="ok">${valid}</b> tanesi geçerli</div>`;
    }
  }

  AF.FamilyMatrix = FamilyMatrix;
  AF.CompatMatrix = CompatMatrix;
})();
