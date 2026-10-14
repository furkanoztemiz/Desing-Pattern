/*
 * Hafif Java sözdizimi renklendirici (dış kütüphane yok).
 * Çıktı: satır başına HTML dizisi → satır numarası ve satır vurgusu kolaylaşır.
 */
(function () {
  'use strict';

  const KEYWORDS = new Set(
    ('abstract assert break case catch class const continue default do else enum extends final finally for goto if ' +
      'implements import instanceof interface native new package private protected public return static strictfp super ' +
      'switch synchronized this throw throws transient try volatile while var record sealed permits yield').split(' ')
  );
  const LITERALS = new Set(['true', 'false', 'null']);
  const PRIMITIVES = new Set('void int double boolean char long float byte short'.split(' '));

  // Sıra önemli: yorumlar ve metinler önce yakalanır.
  const RULES = [
    ['com', /\/\*[\s\S]*?\*\//y],
    ['com', /\/\/[^\n]*/y],
    ['str', /"(?:[^"\\\n]|\\.)*"/y],
    ['str', /'(?:[^'\\\n]|\\.)+'/y],
    ['blank', /⟦(\d+)⟧/y], // alıştırmalardaki boşluklar
    ['ann', /@[A-Za-z_]\w*/y],
    ['num', /\b\d[\d_]*(?:\.\d+)?[fFdDlL]?\b/y],
    ['id', /[\p{L}_$][\p{L}\p{N}_$]*/uy],
    ['ws', /\s+/y],
  ];

  function tokenize(src) {
    const toks = [];
    let i = 0;
    outer: while (i < src.length) {
      for (const [type, re] of RULES) {
        re.lastIndex = i;
        const m = re.exec(src);
        if (m && m[0].length) {
          toks.push({ type, text: m[0], m });
          i += m[0].length;
          continue outer;
        }
      }
      toks.push({ type: 'p', text: src[i] });
      i++;
    }
    return toks;
  }

  function classify(toks, opts) {
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (t.type !== 'id') continue;
      const w = t.text;
      if (KEYWORDS.has(w) || PRIMITIVES.has(w)) {
        t.cls = 'kw';
        continue;
      }
      if (LITERALS.has(w)) {
        t.cls = 'lit';
        continue;
      }
      if (opts.special && opts.special[w]) {
        t.cls = opts.special[w];
        continue;
      }
      if (/^[A-Z]/.test(w)) {
        t.cls = 'type';
        const r = opts.roleOf ? opts.roleOf(w) : null;
        if (r) t.role = r;
        continue;
      }
      let n = k + 1;
      while (n < toks.length && toks[n].type === 'ws') n++;
      t.cls = n < toks.length && toks[n].text === '(' ? 'fn' : 'id';
    }
  }

  /**
   * @param {string} src Java kaynak kodu
   * @param {{roleOf?:Function, special?:Object}} opts
   * @returns {string[]} satır başına HTML
   */
  DP.highlightJava = function (src, opts) {
    opts = opts || {};
    const toks = tokenize(src);
    classify(toks, opts);
    const lines = [''];
    for (const t of toks) {
      if (t.type === 'blank') {
        lines[lines.length - 1] += `<span class="blank" data-blank="${t.m[1]}" role="button" tabindex="0"></span>`;
        continue;
      }
      const cls = t.type === 'id' ? t.cls : t.type;
      const parts = t.text.split('\n');
      parts.forEach((part, idx) => {
        if (idx > 0) lines.push('');
        if (!part) return;
        const e = DP.esc(part);
        if (cls === 'ws' || cls === 'p' || cls === 'id') lines[lines.length - 1] += e;
        else lines[lines.length - 1] += `<span class="tk-${cls}${t.role ? ' rc rc-' + t.role : ''}">${e}</span>`;
      });
    }
    return lines;
  };
})();
