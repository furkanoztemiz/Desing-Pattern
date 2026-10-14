/*
 * Abstract Factory — sahneler (3/3): Genişlet, FM ↔ AF, Gerçek Dünya, Quiz, Özet + kalıp kaydı
 */
(function () {
  'use strict';
  const AF = DP.af;
  const FM = DP.fm;
  const { h } = DP;
  const kit = DP.kit;
  const ui = AF.ui;
  const md = AF.md;
  const F = AF.families;

  // ================================================================== 6. GENİŞLET: yeni aile ✓ · yeni ürün türü ✗
  const EX_FACTORY = `public class HavaFabrikasi implements ⟦1⟧ {

    @Override
    public ⟦2⟧ aracOlustur() {
        return new ⟦3⟧();
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new ⟦4⟧();
    }
}`;
  const EX_DOC = `public class HavaKonsimentosu implements ⟦5⟧ {

    @Override
    public String ad() {
        return "AWB";
    }

    @Override
    public void hazirla(String yuk) {
        System.out.println("[AWB] " + yuk + " için hava yolu taşıma senedi düzenlendi.");
    }
}`;
  const OLD = ['TeslimatServisi', 'LojistikFabrikasi', 'TasimaAraci', 'TasimaBelgesi', 'KaraFabrikasi', 'DenizFabrikasi', 'Kamyon', 'Gemi', 'CmrBelgesi', 'Konsimento'];
  const HAVA = ['HavaFabrikasi', 'Ucak', 'HavaKonsimentosu'];

  AF.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('Görev: Hava ailesini ekle', { cls: 'panel-code panel-ex' });
    const viewTools = h('div', { class: 'panel-tools' });
    const right = kit.panel('Sistem görünümü', { cls: 'panel-side', extra: viewTools });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol (adım 0–2): yeni AİLE alıştırması
    const exBox = h('div', { class: 'ex-box' });
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Genel Müdür:** “Acil kargolar için hava yolu şart!” Hava ailesi: [[Ucak]] + [[HavaKonsimentosu]] (AWB). [[Ucak]] sınıfı hazır.\nKural: **mevcut hiçbir dosyayı değiştirmeden** sistemi genişletin.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'HavaFabrikasi.java', code: EX_FACTORY, badge: 'YENİ' },
        { name: 'HavaKonsimentosu.java', code: EX_DOC, badge: 'YENİ' },
      ],
      answers: { 1: 'LojistikFabrikasi', 2: 'TasimaAraci', 3: 'Ucak', 4: 'HavaKonsimentosu', 5: 'TasimaBelgesi' },
      hints: {
        1: 'Bir somut fabrika hangi **soyut fabrika** arayüzünü gerçekler?',
        2: '`aracOlustur()` bir **soyut ürün** döndürür: hangisi?',
        3: 'Hava ailesinin **aracı** hangisi?',
        4: 'Uçakla hangi belge gider? (CMR karayolu içindir!)',
        5: 'Bir belge sınıfı hangi **soyut ürün** arayüzünü gerçekler?',
      },
      choices: ['LojistikFabrikasi', 'TasimaAraci', 'TasimaBelgesi', 'Ucak', 'Kamyon', 'HavaKonsimentosu', 'CmrBelgesi'],
      roleOf: AF.roleOf,
      special: AF.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> Hava ailesi hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    exBox.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sol (adım 3–4): yeni ÜRÜN TÜRÜ
    const typeBox = h('div', { class: 'type-box', hidden: true });
    const typeTask = h('div', { class: 'task-card is-alert' });
    const typeCode = h('div', { class: 'type-code' });
    const typeConsole = h('div', { class: 'console af-console' });
    typeBox.append(typeTask, typeCode, typeConsole);
    left.body.append(exBox, typeBox);
    const typeCv = new DP.CodeView(typeCode, { roleOf: AF.roleOf, special: AF.special });

    // ---- sağ: matris / UML + etki
    const matrixHost = h('div', { class: 'matrix-host' });
    const diagHost = h('div', { class: 'diag-host', hidden: true });
    const impact = h('div', { class: 'impact' });
    right.body.append(matrixHost, diagHost, impact);
    const matrix = new AF.FamilyMatrix(matrixHost);
    const diagram = new DP.ClassDiagram(diagHost, AF.diagram({ hava: true }), { roles: AF.roles, roleTags: false });
    const viewSeg = kit.seg(
      [
        { v: 'matrix', label: 'Aile matrisi' },
        { v: 'uml', label: 'UML' },
      ],
      'matrix',
      (v) => {
        matrixHost.hidden = v !== 'matrix';
        diagHost.hidden = v !== 'uml';
      }
    );
    viewTools.appendChild(viewSeg.el);

    const factoryCodes = AF.familyOrder.map((k) => ({ name: F[k].factory, src: AF.code.factory(F[k]) }));

    const STEPS = [
      { t: 'Görev: yeni bir AİLE ekle', x: 'Matristeki boş satıra yeni bir aile ekleyeceğiz. Boşluklara tıklayıp doğru sınıfları seçin. **Dikkat:** belgeyi yanlış aileden seçerseniz derleyici değil, gümrük yakalardı — burada siz yakalayın!' },
      { t: 'Derlendi: yeni satır', x: 'Hava ailesi için üç yeni sınıf: [[HavaFabrikasi]], [[Ucak]] ve [[HavaKonsimentosu]]. Matriste yeni bir **satır** belirdi.' },
      { t: 'Mevcut kod: dokunulmadı', x: '[[TeslimatServisi]], [[LojistikFabrikasi]] ve mevcut aileler **değişmedi**. Yeni aile eklemek, Açık/Kapalı İlkesi’ne tam uyar: genişlemeye açık, değişikliğe kapalı.' },
      { t: 'Yeni istek: bir ÜRÜN TÜRÜ eklemek', x: 'Yönetim her gönderiye **sigorta poliçesi** istiyor. Bu yeni bir **sütun** demek: [[LojistikFabrikasi]] arayüzüne `sigortaOlustur()` eklenince **tüm** somut fabrikalar derlenmez hâle gelir.' },
      { t: 'Ödünleşim (trade-off)', x: 'Abstract Factory’de **aile (satır) eklemek kolay**, **ürün türü (sütun) eklemek zor**. Java 8+ `default` metotları acıyı hafifletir ama ailenin tutarlılığını garanti etmez. **Hava ailesi artık Canlı Akış’ta seçilebilir!**' },
    ];

    function renderLeft(i) {
      exBox.hidden = i >= 3;
      typeBox.hidden = i < 3;
      left.head.querySelector('.panel-title').innerHTML = i >= 3 ? 'Yeni ürün türü: <span class="ver">TasimaSigortasi</span>' : 'Görev: Hava ailesini ekle';
      if (i < 3) return;
      if (i === 3) {
        typeTask.innerHTML = md('📩 **Yönetim:** “Her gönderiye bir **sigorta poliçesi** eklensin!”\nYeni bir ürün türü → soyut fabrikaya yeni bir metot.');
        typeCv.setFiles([{ name: 'LojistikFabrikasi.java', code: AF.code.withInsurance }], { prev: { 'LojistikFabrikasi.java': AF.code.LojistikFabrikasi } });
        typeCv.mark('LojistikFabrikasi.java', 'sigortaOlustur', 'bad', { scroll: false });
        writeConsole('$ javac *.java', AF.compileErrors(factoryCodes));
      } else {
        typeTask.innerHTML = md('💡 **Java 8+ ipucu:** Arayüze `default` gövdeli bir metot eklersek mevcut fabrikalar derlenmeye devam eder.');
        typeCv.setFiles([{ name: 'LojistikFabrikasi.java', code: AF.code.withDefault }], { prev: { 'LojistikFabrikasi.java': AF.code.withInsurance } });
        typeCv.mark('LojistikFabrikasi.java', 'default TasimaSigortasi', 'focus', { scroll: false });
        writeConsole('$ javac *.java', [{ t: '(hata yok — derleme başarılı)' }, { t: 'Ama dikkat: Hava ailesi de “standart” sigortayı alır; aile tutarlılığı artık sizin sorumluluğunuzda.', err: true }]);
      }
    }

    function writeConsole(cmd, lines) {
      typeConsole.innerHTML = '<div class="console-head"><span></span><span></span><span></span> Derleyici</div>';
      typeConsole.appendChild(h('div', { class: 'console-line is-cmd' }, cmd));
      lines.forEach((l) => typeConsole.appendChild(h('div', { class: 'console-line' + (l.err ? ' is-err' : '') }, l.t)));
    }

    function renderRight(i, animate) {
      const famRows = i >= 1 ? ['kara', 'deniz', 'hava'] : ['kara', 'deniz', 'hava'];
      const st = { rows: famRows, cols: ['arac', 'belge'], rowBadge: {}, cell: {} };
      if (i === 0) st.pendingRow = 'hava';
      if (i >= 1) {
        st.rowBadge.hava = ['YENİ', 'new'];
        if (i === 1) {
          st.newRow = 'hava';
          st.focusRow = 'hava';
        }
      }
      if (i === 2) {
        st.rowBadge.kara = ['✓ değişmedi', 'same'];
        st.rowBadge.deniz = ['✓ değişmedi', 'same'];
      }
      if (i >= 3) {
        st.cols = ['arac', 'belge', 'sigorta'];
        st.focusCol = 'sigorta';
        st.colBadge = { sigorta: i === 3 ? ['YENİ SÜTUN', 'bad'] : ['varsayılan', 'same'] };
        AF.familyOrder.forEach((k) => {
          st.cell[k + ':sigorta'] = i === 3 ? 'missing' : 'default';
          st.rowBadge[k] = i === 3 ? ['✗ değişmeli', 'bad'] : ['derleniyor', 'same'];
        });
      }
      matrix.update(st);

      diagram.setHidden(HAVA, i < 1);
      diagram.clearBadges();
      diagram.clearFocus();
      if (i >= 1 && i <= 2) HAVA.forEach((c) => diagram.badge(c, 'YENİ', 'new'));
      if (i === 1) diagram.focus({ classes: HAVA, edges: ['cr-hava-a', 'cr-hava-b'] });
      if (i === 2) OLD.forEach((c) => diagram.badge(c, '✓', 'same'));
      if (i === 3) {
        diagram.badge('LojistikFabrikasi', '+ sigortaOlustur()', 'bad');
        AF.familyOrder.forEach((k) => diagram.badge(F[k].factory, '✗ derlenmez', 'bad'));
      }

      if (i === 0) {
        impact.innerHTML = `
          <div class="impact-title">İpucu</div>
          <p>${md('Yeni bir aile = bir **somut fabrika** + o ailenin **somut ürünleri**. Başka hiçbir şey değil.')}</p>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı · yeni satır</div>
          <ul class="filelist">${HAVA.map((c) => `<li><span class="cv-dot rc rc-${AF.roleOf(c)}"></span>${c}.java <span class="cv-badge is-new">YENİ</span></li>`).join('')}</ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen mevcut dosya</div></div>
            <div class="metric"><div class="m-val">3</div><div class="m-label">yeni dosya</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">yeni switch dalı</div></div>
          </div>`;
      } else if (i === 3) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-bad"><div class="m-val">4</div><div class="m-label">değişmek zorunda (arayüz + 3 fabrika)</div></div>
            <div class="metric is-bad"><div class="m-val">3</div><div class="m-label">derleme hatası</div></div>
            <div class="metric"><div class="m-val">+3</div><div class="m-label">yeni sigorta sınıfı (her aileye)</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp">
            <thead><tr><th></th><th>Yeni aile (satır)</th><th>Yeni ürün türü (sütun)</th></tr></thead>
            <tbody>
              <tr><td>Değişen mevcut dosya</td><td class="ok">Hiçbiri</td><td class="bad">Arayüz + tüm fabrikalar</td></tr>
              <tr><td>Açık/Kapalı İlkesi</td><td class="ok">✔ Uyumlu</td><td class="bad">✘ İhlal</td></tr>
              <tr><td>Zorluk</td><td class="ok">Kolay</td><td class="bad">Zor</td></tr>
            </tbody>
          </table>
          <button class="btn btn-primary" type="button" data-go>✈ Canlı Akış’ta Hava ailesini dene →</button>`;
        impact.querySelector('[data-go]').addEventListener('click', () => {
          S.family = 'hava';
          ctx.goScene('akis');
        });
      }
      if (animate) DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6000,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate && i === 1);
          S.havaUnlocked = true;
        } else ex.ensureSelection();
        renderLeft(i);
        renderRight(i, info.animate || i !== prev);
      },
    });
    ex.paintAll();
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. FM ↔ AF
  const FM_CODE = `// FACTORY METHOD — karar ALT SINIFTA (kalıtım)
abstract class Lojistik {

    public void teslimatPlanla(String yuk) {
        TasimaAraci arac = aracOlustur();   // tek ürün
        arac.teslimEt(yuk);
    }

    protected abstract TasimaAraci aracOlustur();
}

class KaraLojistigi extends Lojistik {
    @Override
    protected TasimaAraci aracOlustur() {
        return new Kamyon();
    }
}

// Kullanım: ALT SINIFI seçeriz
Lojistik lojistik = new KaraLojistigi();
lojistik.teslimatPlanla("20 ton kayısı");`;

  const AF_CODE = `// ABSTRACT FACTORY — karar VERİLEN NESNEDE (kompozisyon)
interface LojistikFabrikasi {
    TasimaAraci aracOlustur();        // ürün ailesi
    TasimaBelgesi belgeOlustur();
}

class KaraFabrikasi implements LojistikFabrikasi {
    public TasimaAraci aracOlustur()    { return new Kamyon(); }
    public TasimaBelgesi belgeOlustur() { return new CmrBelgesi(); }
}

class TeslimatServisi {
    private final LojistikFabrikasi fabrika;   // HAS-A

    TeslimatServisi(LojistikFabrikasi fabrika) {
        this.fabrika = fabrika;
    }
}

// Kullanım: fabrika NESNESİNİ veririz
new TeslimatServisi(new KaraFabrikasi()).gonder("20 ton kayısı");`;

  AF.scenes.compare = function (root, ctx) {
    const el = h('div', { class: 'scene scene-split scene-compare' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = kit.panel('<span class="cmp-badge fm">FM</span> Factory Method', { cls: 'panel-code' });
    const right = kit.panel('<span class="cmp-badge af">AF</span> Abstract Factory', { cls: 'panel-code' });
    body.append(left.el, right.el);
    const table = h('div', { class: 'cmp-big', hidden: true });
    el.append(body, table);
    root.appendChild(el);

    const fmCv = new DP.CodeView(left.body, { files: [{ name: 'FactoryMethod.java', code: FM_CODE }], roleOf: FM.roleOf, special: FM.special });
    const afCv = new DP.CodeView(right.body, { files: [{ name: 'AbstractFactory.java', code: AF_CODE }], roleOf: AF.roleOf, special: AF.special });

    table.innerHTML = `
      <table class="cmp cmp-wide">
        <thead><tr><th></th><th>Factory Method</th><th>Abstract Factory</th></tr></thead>
        <tbody>
          <tr><td>Amaç</td><td>Tek bir ürünün oluşturulmasını alt sınıflara bırakmak</td><td>İlişkili ürün <b>ailelerini</b> birlikte oluşturmak</td></tr>
          <tr><td>Mekanizma</td><td><b>Kalıtım</b>: alt sınıf override eder</td><td><b>Kompozisyon</b>: istemciye fabrika nesnesi verilir</td></tr>
          <tr><td>Kararı kim verir?</td><td>Yaratıcının alt sınıfı (<code>new KaraLojistigi()</code>)</td><td>Verilen fabrika nesnesi (<code>new KaraFabrikasi()</code>)</td></tr>
          <tr><td>Ürün sayısı</td><td>Bir</td><td>Birden çok (aile)</td></tr>
          <tr><td>Tutarlılık garantisi</td><td>— (tek ürün)</td><td class="ok">Var: ürünler aynı aileden</td></tr>
          <tr><td>Çalışma zamanında değiştirmek</td><td class="bad">Zor (nesnenin sınıfı sabit)</td><td class="ok">Kolay (başka nesne ver)</td></tr>
          <tr><td>Genişletmek</td><td>Yeni ürün → yeni alt sınıf</td><td>Yeni aile: kolay · yeni ürün türü: zor</td></tr>
          <tr><td>Birlikte kullanım</td><td colspan="2">Abstract Factory’nin metotları çoğu zaman <b>fabrika metodudur</b>; somut fabrikalar genellikle <b>Singleton</b>’dır.</td></tr>
        </tbody>
      </table>`;

    const STEPS = [
      { t: 'Aynı soru, iki cevap', x: 'İki kalıp da “**nesneyi kim oluşturur?**” sorusunu oluşturmayı istemciden ayırarak çözer. Fark, **kararın nerede durduğunda**.' },
      { t: 'Mekanizma: kalıtım ↔ kompozisyon', x: 'FM’de karar bir **alt sınıfın override ettiği metotta** (`extends`). AF’de karar istemcinin **alanında tuttuğu nesnede** (`private final LojistikFabrikasi fabrika`).', fm: ['class KaraLojistigi extends Lojistik', 'protected abstract TasimaAraci aracOlustur();'], af: ['private final LojistikFabrikasi fabrika;', 'this.fabrika = fabrika;'] },
      { t: 'Seçim nerede yapılıyor?', x: 'FM’de istemcinin **kendi alt sınıfını** seçeriz. AF’de istemciye bir **işbirlikçi nesne** veririz — istersek çalışma zamanında bile başka bir fabrika verebiliriz.', fm: ['new KaraLojistigi()'], af: ['new TeslimatServisi(new KaraFabrikasi())'] },
      { t: 'Kaç ürün?', x: 'FM tek bir ürün üretir. AF bir **aile** üretir ve ailenin üyelerinin birbirine uymasını garanti eder.', fm: ['TasimaAraci arac = aracOlustur();'], af: ['TasimaAraci aracOlustur();', 'TasimaBelgesi belgeOlustur();'] },
      { t: 'Rakip değil, takım arkadaşı', x: 'Sağdaki `aracOlustur()` ve `belgeOlustur()` gerçekleştirimleri birer **fabrika metodu**. Abstract Factory çoğu zaman fabrika metotlarıyla kurulur.', af: ['public TasimaAraci aracOlustur()', 'public TasimaBelgesi belgeOlustur()'] },
      { t: 'Sınav tablosu', x: 'Tek ürün + kalıtım → **Factory Method**. Ürün ailesi + tutarlılık + kompozisyon → **Abstract Factory**.' },
    ];

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 6500,
      onChange: (i) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        fmCv.clear();
        afCv.clear();
        (s.fm || []).forEach((m, k) => fmCv.mark('FactoryMethod.java', m, 'focus', { scroll: k === 0 }));
        (s.af || []).forEach((m, k) => afCv.mark('AbstractFactory.java', m, 'focus', { scroll: k === 0 }));
        body.hidden = i === STEPS.length - 1;
        table.hidden = i !== STEPS.length - 1;
        if (!table.hidden) DP.flash(table, 'is-pop');
      },
    });
    return kit.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 8. GERÇEK DÜNYA
  const RW = [
    {
      tab: 'Swing Look-and-Feel',
      title: '`UIManager.setLookAndFeel()` — tek satırla bütün bileşen ailesi değişir',
      intro: 'Swing’in değiştirilebilir görünüm (Pluggable Look-and-Feel) mimarisi klasik bir Abstract Factory örneğidir: seçilen **Look-and-Feel**, her bileşen için kendi ailesinden bir arayüz nesnesi (*UI delegate*) üretir. Kodunuz yalnızca `new JButton()` der; düğmenin nasıl çizileceğine aile karar verir.',
      map: [
        ['abstractFactory', 'LojistikFabrikasi', '`LookAndFeel` (+ `UIManager`)'],
        ['concreteFactory', 'KaraFabrikasi', '`MetalLookAndFeel`, `NimbusLookAndFeel`, `WindowsLookAndFeel`'],
        ['abstractProduct', 'TasimaAraci', '`ButtonUI`, `CheckBoxUI`, `SliderUI`'],
        ['concreteProduct', 'Kamyon', '`MetalButtonUI`, `SynthButtonUI`, `WindowsButtonUI` …'],
        ['client', 'TeslimatServisi', 'Sizin Swing kodunuz (`JButton`, `JSlider` …)'],
      ],
      note: 'Teknik ayrıntı: Swing, UI sınıflarını `UIDefaults` tablosu üzerinden yansıma (reflection) ile oluşturur; kavramsal olarak bir Abstract Factory’dir. Çıktılar Java 21 ile alındı (Windows görünümü yalnızca Windows’ta çalışır).',
      roles: { UIManager: 'abstractFactory', JButton: 'client', JCheckBox: 'client', JSlider: 'client' },
      special: {},
      file: 'LookAndFeelOrnegi.java',
      code: (o) => `import javax.swing.*;

public class LookAndFeelOrnegi {

    public static void main(String[] args) throws Exception {
        // Aile (somut fabrika) YALNIZCA burada seçilir:
        UIManager.setLookAndFeel("${o}");

        // İstemci kodu aynı; ürün ailesi Look-and-Feel'e göre değişir.
        System.out.println(new JButton().getUI().getClass().getName());
        System.out.println(new JCheckBox().getUI().getClass().getName());
        System.out.println(new JSlider().getUI().getClass().getName());
    }
}`,
      mark: 'new JButton()',
      options: [
        { label: 'Metal', arg: 'javax.swing.plaf.metal.MetalLookAndFeel', out: ['javax.swing.plaf.metal.MetalButtonUI', 'javax.swing.plaf.metal.MetalCheckBoxUI', 'javax.swing.plaf.metal.MetalSliderUI'] },
        { label: 'Nimbus', arg: 'javax.swing.plaf.nimbus.NimbusLookAndFeel', out: ['javax.swing.plaf.synth.SynthButtonUI', 'javax.swing.plaf.synth.SynthCheckBoxUI', 'javax.swing.plaf.synth.SynthSliderUI'] },
        { label: 'Windows', arg: 'com.sun.java.swing.plaf.windows.WindowsLookAndFeel', out: ['com.sun.java.swing.plaf.windows.WindowsButtonUI', 'com.sun.java.swing.plaf.windows.WindowsCheckBoxUI', 'com.sun.java.swing.plaf.windows.WindowsSliderUI'] },
      ],
      cmd: '$ java LookAndFeelOrnegi',
    },
    {
      tab: 'JDBC sürücü ailesi',
      title: '`Connection` — aynı sürücüden uyumlu bir nesne ailesi',
      intro: 'Factory Method sahnesinde `createStatement()`’ı tek başına görmüştük. Şimdi `Connection`’ın tamamına bakın: aynı sürücünün **birbiriyle uyumlu** bir ailesini üretir — `Statement`, `PreparedStatement`, `DatabaseMetaData` … PostgreSQL bağlantısından MySQL komutu çıkmaz!',
      map: [
        ['abstractFactory', 'LojistikFabrikasi', '`java.sql.Connection` (arayüz)'],
        ['concreteFactory', 'KaraFabrikasi', '`PgConnection`, `JdbcConnection` (H2) …'],
        ['abstractProduct', 'TasimaAraci', '`Statement`, `PreparedStatement`, `DatabaseMetaData`'],
        ['concreteProduct', 'Kamyon', '`PgStatement`, `PgPreparedStatement` …'],
        ['fm', 'aracOlustur()', '`createStatement()`, `prepareStatement()` …'],
      ],
      note: 'Abstract Factory’nin her “oluştur” metodu bir fabrika metodudur — iki kalıp el ele çalışır. (Çıktı, ilgili sürücü classpath’teyken alınan örnek çıktıdır; sürücü sürümüne göre değişebilir.)',
      roles: { Connection: 'abstractFactory', Statement: 'abstractProduct', PreparedStatement: 'abstractProduct', DatabaseMetaData: 'abstractProduct', DriverManager: 'client' },
      special: { createStatement: 'fm', prepareStatement: 'fm', getMetaData: 'fm' },
      file: 'JdbcAilesi.java',
      code: (o) => `import java.sql.*;

public class JdbcAilesi {

    public static void main(String[] args) throws SQLException {
        // Aile (sürücü) bağlantı URL'siyle seçilir:
        try (Connection baglanti = DriverManager.getConnection("${o}", "ogr", "sifre")) {

            Statement komut = baglanti.createStatement();
            PreparedStatement hazir = baglanti.prepareStatement("SELECT 1");
            DatabaseMetaData bilgi = baglanti.getMetaData();

            System.out.println(komut.getClass().getName());
            System.out.println(hazir.getClass().getName());
            System.out.println(bilgi.getClass().getName());
        }
    }
}`,
      mark: 'baglanti.createStatement()',
      options: [
        { label: 'PostgreSQL', arg: 'jdbc:postgresql://localhost/okul', out: ['org.postgresql.jdbc.PgStatement', 'org.postgresql.jdbc.PgPreparedStatement', 'org.postgresql.jdbc.PgDatabaseMetaData'] },
        { label: 'H2', arg: 'jdbc:h2:mem:okul', out: ['org.h2.jdbc.JdbcStatement', 'org.h2.jdbc.JdbcPreparedStatement', 'org.h2.jdbc.JdbcDatabaseMetaData'] },
      ],
      cmd: '$ java -cp .;surucu.jar JdbcAilesi',
    },
    {
      tab: 'Testte sahte aile',
      title: 'Birim testte gerçek kamyon göndermeden test etmek',
      intro: 'Fabrika dışarıdan verildiği için testte **sahte (mock) bir aile** verebiliriz; `TeslimatServisi`’nin tek satırı bile değişmez. Bu, bağımlılık enjeksiyonunun (*dependency injection*) ve Spring gibi çatıların temel fikridir.',
      map: [
        ['concreteFactory', 'KaraFabrikasi', '`TestFabrikasi` (yalnızca testte)'],
        ['concreteProduct', 'Kamyon', 'İsimsiz (anonim) sahte araç ve belge'],
        ['client', 'TeslimatServisi', 'Değişmeden test edilir'],
      ],
      note: 'Factory Method’da aynı şey için bir **alt sınıf** yazmamız gerekirdi; burada yalnızca **farklı bir nesne** veriyoruz. Çıktı Java 21 ile alındı.',
      roles: { TestFabrikasi: 'concreteFactory', LojistikFabrikasi: 'abstractFactory', TasimaAraci: 'abstractProduct', TasimaBelgesi: 'abstractProduct', TeslimatServisi: 'client' },
      special: { aracOlustur: 'fm', belgeOlustur: 'fm' },
      file: 'TestFabrikasi.java',
      code: () => AF.code.TestFabrikasi,
      mark: 'new TeslimatServisi(new TestFabrikasi())',
      out: ['[Test] belge hazır (sahte).', '[Gümrük] TEST onaylandı.', '[Test] deneme kolisi teslim edildi (sahte).'],
      cmd: '$ java TestFabrikasi',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Diğer yaratımsal kalıplarla farkı',
      intro: 'Abstract Factory, birbirine uyan **hazır bir aileyi** tek seferde verir. Benzer amaçlı kalıplarla karıştırmamak için:',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Abstract Factory</th><th>Builder</th><th>Prototype</th></tr></thead>
        <tbody>
          <tr><td>Ne üretir?</td><td>İlişkili ürün <b>ailesi</b></td><td>Tek, karmaşık bir ürün</td><td>Var olan nesnenin kopyası</td></tr>
          <tr><td>Nasıl?</td><td>Her ürün türü için bir metot</td><td>Adım adım kurulum, sonda <code>build()</code></td><td><code>clone()</code> / kopya kurucu</td></tr>
          <tr><td>Tipik örnek</td><td>Tema, platform, sürücü aileleri</td><td><code>HttpRequest.newBuilder()</code></td><td>Şablon nesneden çoğaltma</td></tr>
        </tbody></table>`,
      note: 'Somut fabrikalar genellikle **tek örnek** olarak kullanılır (Singleton). Ve unutmayın: Abstract Factory’nin metotları çoğu zaman birer **fabrika metodudur**.',
      roles: { LojistikFabrikasi: 'abstractFactory', DenizFabrikasi: 'concreteFactory', TasimaAraci: 'abstractProduct', TasimaBelgesi: 'abstractProduct' },
      special: { aracOlustur: 'fm', belgeOlustur: 'fm' },
      file: 'Karsilastirma.java',
      code: () => `// Builder: TEK bir karmaşık nesneyi adım adım kurar
HttpRequest istek = HttpRequest.newBuilder()
        .uri(URI.create("https://ornek.com"))
        .header("Accept", "application/json")
        .build();

// Abstract Factory: birbirine uyan bir AİLEYİ hazır verir
LojistikFabrikasi fabrika = new DenizFabrikasi();
TasimaAraci arac = fabrika.aracOlustur();       // Gemi
TasimaBelgesi belge = fabrika.belgeOlustur();   // Konşimento`,
    },
  ];

  AF.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: RW,
      roles: AF.roles,
      roleOf: AF.roleOf,
      fmLabel: 'Fabrika metodu',
      footText: (i) =>
        i < 3
          ? 'Kendi örneğimizdeki rolleri Java dünyasında bulun. Sağdaki düğmelerle başka bir **aile** seçin: istemci kodu hiç değişmeden **bütün ürünler birlikte** değişiyor.'
          : 'Yaratımsal kalıpları birbirinden ayırmak sınavda puan kazandırır.',
    });

  // ================================================================== 9. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Abstract Factory kalıbının **temel amacı** nedir?',
      options: ['Bir sınıfın yalnızca tek örneği olmasını sağlamak', 'Birbiriyle ilişkili nesne **ailelerini**, somut sınıflarını belirtmeden oluşturmak', 'Karmaşık bir nesneyi adım adım kurmak', 'Var olan bir nesneyi kopyalayarak yenisini üretmek'],
      answer: 1,
      explain: 'GoF: “İlişkili ya da bağımlı nesne ailelerini, somut sınıflarını belirtmeden oluşturmak için bir arayüz sağla.” Diğerleri Singleton, Builder ve Prototype’ın amaçlarıdır.',
    },
    {
      type: 'line',
      q: 'Bu programda **ürün ailesinin seçildiği** satıra tıklayın.',
      codeName: 'Main.java',
      code: AF.code.main(F.deniz, F.deniz.cargo),
      answer: 'new DenizFabrikasi()',
      explain: 'Aile yalnızca bu satırda seçilir. [[TeslimatServisi]] ve diğer sınıflar hangi aileyle çalıştıklarını bilmez.',
    },
    {
      type: 'mcq',
      q: 'Kalıpsız sürüm 2.0’daki **Uçak + CMR** hatasını Abstract Factory nasıl önler?',
      options: ['Derleyici string karşılaştırmalarını denetler', 'Gümrük kontrolünü tamamen kaldırır', 'Araç ve belge **aynı somut fabrikadan** geldiği için aileler karışamaz', 'Tüm belgeleri tek bir sınıfta toplar'],
      answer: 2,
      explain: 'İstemci aracı da belgeyi de **aynı** fabrika nesnesinden ister. [[HavaFabrikasi]] yalnızca Uçak ve AWB üretebilir; yanlış eşleşme yapısal olarak imkânsızdır.',
    },
    {
      type: 'mcq',
      q: 'Sisteme yeni bir **aile** (ör. Demiryolu: Tren + demiryolu belgesi) eklemek için ne gerekir?',
      options: ['Yeni bir somut fabrika ve o ailenin somut ürünlerini yazmak; mevcut kod değişmez', '[[LojistikFabrikasi]] arayüzüne yeni bir metot eklemek', '[[TeslimatServisi]] içine yeni bir switch dalı eklemek', 'Tüm somut fabrikaları değiştirmek'],
      answer: 0,
      explain: 'Aile eklemek matrise yeni bir **satır** eklemektir: yeni sınıflar yazılır, eskiler değişmez (OCP).',
    },
    {
      type: 'mcq',
      q: 'Yeni bir **ürün türü** (ör. sigorta poliçesi) eklemek neden zordur?',
      options: ['Java arayüzleri genişletilemez', 'İstemci kodu silinmek zorundadır', 'Ürün türü sayısı ikiyi geçemez', 'Soyut fabrika arayüzü değişir; bu yüzden **tüm somut fabrikalar** değişmek zorundadır'],
      answer: 3,
      explain: 'Ürün türü eklemek matrise yeni bir **sütun** eklemektir: arayüze yeni metot gelir ve onu gerçeklemeyen her fabrika derlenmez. (Java 8 `default` metotları acıyı hafifletebilir.)',
    },
    {
      type: 'mcq',
      q: 'Factory Method ile Abstract Factory arasındaki **mekanizma** farkı nedir?',
      options: ['FM kompozisyon, AF kalıtım kullanır', 'İkisi de yalnızca statik metot kullanır', 'FM **kalıtımla** (alt sınıf override eder), AF **kompozisyonla** (istemciye fabrika nesnesi verilir) çalışır', 'AF yalnızca tek ürün üretir'],
      answer: 2,
      explain: 'Factory Method’da kararı alt sınıf verir; Abstract Factory’de istemcinin alanında tuttuğu fabrika nesnesi.',
    },
    {
      type: 'mcq',
      q: '[[TeslimatServisi]], fabrikayı kurucu (constructor) parametresi olarak alıyor. Bunun **en önemli kazancı** nedir?',
      options: ['Fabrika **dışarıdan değiştirilebilir**; testte sahte bir aile verilebilir', 'Program daha hızlı çalışır', '[[TeslimatServisi]] için alt sınıf yazmak zorunlu olur', 'Somut ürünlere doğrudan erişilir'],
      answer: 0,
      explain: 'Bağımlılık enjeksiyonu: istemci kendi bağımlılığını üretmez, alır. Bu sayede aile çalışma zamanında ya da testte değiştirilebilir.',
    },
    {
      type: 'mcq',
      q: 'Swing’de `UIManager.setLookAndFeel(...)` çağrısı Abstract Factory açısından neye karşılık gelir?',
      options: ['Somut bir ürün oluşturmaya', 'Soyut bir ürün tanımlamaya', 'İstemciyi değiştirmeye', '**Somut fabrikayı** (bileşen ailesini) seçmeye'],
      answer: 3,
      explain: 'Look-and-Feel seçmek, bütün UI bileşenlerinin ailesini (Metal, Nimbus, Windows…) tek seferde değiştirir: tıpkı `new KaraFabrikasi()` gibi.',
    },
  ];

  AF.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: AF.roleOf,
      special: AF.special,
      patternName: 'Abstract Factory',
      match: {
        items: ['TeslimatServisi', 'LojistikFabrikasi', 'KaraFabrikasi', 'DenizFabrikasi', 'TasimaAraci', 'TasimaBelgesi', 'Kamyon', 'CmrBelgesi'].map((id) => ({ id, label: id })),
        buckets: ['client', 'abstractFactory', 'concreteFactory', 'abstractProduct', 'concreteProduct'].map((k) => ({ id: k, title: AF.roles[k].en, sub: AF.roles[k].tr, color: AF.roles[k].color })),
        answer: AF.classRoles,
        hint: 'Sekiz sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 10. ÖZET
  AF.scenes.summary = function (root, ctx) {
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat">Yaratımsal · Creational</span><span class="chip">Diğer adı: Kit (Takım)</span></div>
          <h1>Abstract Factory — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          <a class="btn btn-ghost" href="#/factory-method/ozet">← Factory Method özeti</a>
          ${DP.patterns.singleton ? '<a class="btn btn-primary" href="#/singleton">Sıradaki kalıp: Singleton →</a>' : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Birbiriyle ilişkili ya da bağımlı <b>nesne ailelerini</b>, somut sınıflarını belirtmeden oluşturmak için bir arayüz sağla.</p>
          <div class="sum-formula"><code>Client</code> → <code>AbstractFactory</code> → <code class="tk-fm">createProductA()</code> + <code class="tk-fm">createProductB()</code> → <code>ProductA1 + ProductB1</code> <span>(aynı aile)</span></div>
        </article>
        <article class="card sum-uml"><h3>Yapı</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Ne zaman kullanılır?</h3>
          <ul>
            <li>Sistem, ürünlerinin nasıl oluşturulduğundan <b>bağımsız</b> olmalıysa,</li>
            <li>Sistem <b>birden çok aileden biriyle</b> yapılandırılacaksa,</li>
            <li>İlişkili ürünlerin <b>birlikte</b> kullanılması zorunluysa,</li>
            <li>Bir kütüphanenin yalnızca <b>arayüzlerini</b> açığa çıkarmak istiyorsanız.</li>
          </ul>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('abstractFactory')} her ürün türü için oluşturma metodu</li>
            <li>${ui.roleChip('concreteFactory')} bir ailenin ürünlerini üretir</li>
            <li>${ui.roleChip('abstractProduct')} bir ürün türünün arayüzü</li>
            <li>${ui.roleChip('concreteProduct')} ailenin somut ürünü</li>
            <li>${ui.roleChip('client')} yalnızca arayüzleri kullanır</li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>Tutarlılık:</b> bir ailenin ürünleri karışmaz</li>
            <li><b>Yalıtım:</b> istemci somut sınıfları tanımaz (DIP)</li>
            <li><b>Tek satırla aile değişimi</b>, çalışma zamanında bile</li>
            <li><b>OCP:</b> yeni aile = yeni sınıflar · <b>Test:</b> sahte aile verilebilir</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li><b>Yeni ürün türü eklemek zor:</b> arayüz ve tüm fabrikalar değişir</li>
            <li>Sınıf sayısı hızla artar (aile × ürün türü)</li>
            <li>Tek aileli basit durumlarda gereksiz karmaşıklık</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Factory Method:</b> AF’nin oluşturma metotları çoğu zaman fabrika metodudur.</li>
            <li><b>Singleton:</b> somut fabrikadan genellikle tek örnek yeterlidir.</li>
            <li><b>Prototype:</b> fabrika, ürünleri prototip klonlayarak da üretebilir.</li>
            <li><b>Builder:</b> tek ve karmaşık bir ürünü adım adım kurar.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Kod kokusu → kalıp</h3>
          <p>Aynı “tür” kararı birden çok yerde tekrarlanıyorsa Abstract Factory’yi düşünün:</p>
          <pre class="mini-code">arac  = aracSec(tur);    // switch (tur) ...
belge = belgeSec(tur);   // switch (tur) ... aynı karar, ikinci kez!</pre>
          <p class="exam"><b>Sınav ipucu:</b> Ürün <u>ailesi</u> + <u>tutarlılık</u> + <u>kompozisyon</u> → Abstract Factory · Tek ürün + kalıtım → Factory Method</p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/abstractfactory/cozum   → kalıplı çözüm (3 aile + test ailesi)
java/abstractfactory/sorun   → kalıpsız sürüm 2.0 (gümrükte patlar)</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const spec = AF.diagram({});
    spec.classes = spec.classes.filter((c) => !c.hidden);
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), spec, { roles: AF.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'abstract-factory',
    name: 'Abstract Factory',
    tr: 'Soyut Fabrika',
    category: 'creational',
    roleOf: AF.roleOf,
    initialState: () => ({
      family: 'kara',
      cargo: { kara: F.kara.cargo, deniz: F.deniz.cargo, hava: F.hava.cargo },
      havaUnlocked: false,
      view: 'stage',
      showCode: true,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: AF.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: AF.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: AF.scenes.solution },
      { id: 'yapi', title: 'Yapı (UML)', mount: AF.scenes.structure },
      { id: 'akis', title: 'Canlı Akış', mount: AF.scenes.flow, star: true },
      { id: 'genislet', title: 'Genişlet', mount: AF.scenes.extend },
      { id: 'fark', title: 'FM ↔ AF', mount: AF.scenes.compare },
      { id: 'gercek', title: 'Gerçek Dünya', mount: AF.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: AF.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: AF.scenes.summary },
    ],
  });
})();
