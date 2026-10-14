/*
 * Factory Method — sahneler (3/3): Genişlet (OCP), Gerçek Dünya, Quiz, Özet + kalıp kaydı
 */
(function () {
  'use strict';
  const FM = DP.fm;
  const { h } = DP;
  const kit = DP.kit;
  const ui = FM.ui;
  const md = FM.md;

  // ================================================================== 6. GENİŞLET (Açık/Kapalı İlkesi)
  const EX_UCAK = `public class Ucak implements ⟦1⟧ {

    @Override
    public void teslimEt(String yuk) {
        System.out.println("[Uçak] " + yuk + " havayoluyla teslim edildi.");
    }
}`;
  const EX_HAVA = `public class HavaLojistigi extends ⟦2⟧ {

    @Override
    protected ⟦3⟧ aracOlustur() {
        return new ⟦4⟧();
    }
}`;
  const OLD_CLASSES = ['Lojistik', 'TasimaAraci', 'KaraLojistigi', 'DenizLojistigi', 'Kamyon', 'Gemi'];

  FM.scenes.extend = function (root, ctx) {
    const S = ctx.state;
    S.ext = S.ext || {};
    const el = h('div', { class: 'scene scene-split' });
    const body = h('div', { class: 'scene-body cols-50' });
    const left = ui.panel('Görev: Hava kargo ekle', { cls: 'panel-code panel-ex' });
    const right = ui.panel('Sistem görünümü', { cls: 'panel-side' });
    body.append(left.el, right.el);
    el.appendChild(body);
    root.appendChild(el);

    // ---- sol: görev + boşluklu kod + seçenekler
    const task = h('div', {
      class: 'task-card',
      html: md('📩 **Genel Müdür:** “Acil kargolar için hava yolu şart!”\nKural: **mevcut hiçbir dosyayı değiştirmeden** sistemi genişletin. Boşluğa, sonra doğru sınıf adına tıklayın.'),
    });
    const ex = kit.blankExercise({
      files: [
        { name: 'Ucak.java', code: EX_UCAK, badge: 'YENİ' },
        { name: 'HavaLojistigi.java', code: EX_HAVA, badge: 'YENİ' },
      ],
      answers: { 1: 'TasimaAraci', 2: 'Lojistik', 3: 'TasimaAraci', 4: 'Ucak' },
      hints: {
        1: '[[Ucak]] bir taşıma aracı: hangi **arayüzü** gerçeklemeli?',
        2: '[[HavaLojistigi]] hangi **soyut yaratıcıyı** genişletmeli?',
        3: 'Fabrika metodunun dönüş tipi **soyut ürün** olmalı.',
        4: 'Hava lojistiği hangi **somut ürünü** üretir?',
      },
      choices: ['TasimaAraci', 'Lojistik', 'Ucak', 'Kamyon', 'KaraLojistigi', 'Object'],
      roleOf: FM.roleOf,
      special: FM.special,
      state: S.ext,
      doneText: '<b class="ok">✔ Derleme başarılı!</b> İki yeni sınıf hazır.',
      onSolved: () => {
        DP.fx.confetti();
        DP.fx.toast('Derleme başarılı! 🎉');
        setTimeout(() => stepper.index === 0 && stepper.go(1), DP.dur(900));
      },
      onShowAnswers: () => stepper.index === 0 && stepper.go(1),
      onReset: () => stepper.go(0),
    });
    left.body.append(task, ex.wrap, ex.chipRow, ex.actions);

    // ---- sağ: diyagram + etki paneli
    const diagHost = h('div', { class: 'diag-host' });
    const impact = h('div', { class: 'impact' });
    right.body.append(diagHost, impact);
    const diagram = new DP.ClassDiagram(diagHost, FM.diagram({ hava: true, ghosts: true }), { roles: FM.roles, roleTags: true });

    const STEPS = [
      { t: 'Görev: genişlet ama değiştirme', x: 'Sistemi **genişletin** ama mevcut hiçbir dosyayı **değiştirmeyin**. Önce bir boşluğa, sonra aşağıdaki uygun sınıf adına tıklayın. (Sınıfla birlikte tahmin yürütün!)' },
      { t: 'Derlendi: iki yeni sınıf', x: 'Hava taşımacılığı için iki yeni sınıf yazdık: [[Ucak]] (somut ürün) ve [[HavaLojistigi]] (somut yaratıcı). Diyagramdaki kesik çizgili yerler artık gerçek sınıflar.' },
      { t: 'Mevcut kod: dokunulmadı', x: 'Mevcut altı sınıfın **hiçbiri değişmedi**. [[Lojistik]] ve [[TasimaAraci]] dahil hiçbir dosya açılmadı; yeniden test edilmesi gereken eski kod yok. **Açık/Kapalı İlkesi:** genişlemeye açık, değişikliğe kapalı.' },
      { t: 'Karşılaştırma ve kullanım', x: 'Kalıpsız çözümde aynı istek [[Lojistik]] sınıfını değiştirmeyi gerektiriyordu. Factory Method ile yeni sınıfı yalnızca istemcinin seçim noktası tanır. **Hava artık Canlı Akış sahnesinde seçilebilir!**' },
    ];

    function renderImpact(i) {
      if (i === 0) {
        impact.innerHTML = `
          <div class="impact-title">İpucu</div>
          <p>${md('Gereken yalnızca iki şey: yeni bir **somut ürün** ve onu üreten yeni bir **somut yaratıcı**.')}</p>
          <ul class="filelist"><li><span class="cv-dot rc rc-5"></span>Ucak.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-3"></span>HavaLojistigi.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 1) {
        impact.innerHTML = `
          <div class="impact-title ok">✔ Derleme başarılı</div>
          <ul class="filelist"><li><span class="cv-dot rc rc-5"></span>Ucak.java <span class="cv-badge is-new">YENİ</span></li><li><span class="cv-dot rc rc-3"></span>HavaLojistigi.java <span class="cv-badge is-new">YENİ</span></li></ul>`;
      } else if (i === 2) {
        impact.innerHTML = `
          <div class="metrics">
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">değişen mevcut dosya</div></div>
            <div class="metric"><div class="m-val">2</div><div class="m-label">yeni dosya</div></div>
            <div class="metric is-good"><div class="m-val">0</div><div class="m-label">yeni if / else dalı</div></div>
          </div>`;
      } else {
        impact.innerHTML = `
          <table class="cmp">
            <thead><tr><th></th><th>Kalıpsız</th><th>Factory Method</th></tr></thead>
            <tbody>
              <tr><td>Değişen mevcut dosya</td><td class="bad">Lojistik.java + çağıranlar</td><td class="ok">Hiçbiri</td></tr>
              <tr><td>Yeni if / else dalı</td><td class="bad">+1</td><td class="ok">0</td></tr>
              <tr><td>Yeniden test edilecek</td><td class="bad">Lojistik’in tamamı</td><td class="ok">Yalnızca yeni sınıflar</td></tr>
              <tr><td>Açık/Kapalı İlkesi</td><td class="bad">✘ İhlal</td><td class="ok">✔ Uyumlu</td></tr>
            </tbody>
          </table>
          <div class="usage">İstemcide tek satır: <code>Lojistik lojistik = new <span class="cls rc rc-3">HavaLojistigi</span>();</code></div>
          <button class="btn btn-primary" type="button" data-go>✈ Canlı Akış’ta dene →</button>`;
        impact.querySelector('[data-go]').addEventListener('click', () => {
          S.variant = 'hava';
          ctx.goScene('akis');
        });
      }
      DP.flash(impact, 'is-pop');
    }

    const foot = ui.foot(el);
    const stepper = new DP.Stepper(foot.stepHost, {
      count: STEPS.length,
      labels: STEPS.map((s) => s.t),
      delayOf: () => 5600,
      onChange: (i, prev, info) => {
        const s = STEPS[i];
        foot.set(i, STEPS.length, s.t, s.x);
        if (i >= 1) {
          ex.autoFill(info.animate);
          S.havaUnlocked = true;
        } else ex.ensureSelection();
        diagram.setHidden(['HavaLojistigi', 'Ucak'], i < 1);
        diagram.setHidden(['ghostC', 'ghostP'], i >= 1);
        diagram.clearBadges();
        diagram.clearFocus();
        if (i >= 1) {
          diagram.badge('HavaLojistigi', 'YENİ', 'new');
          diagram.badge('Ucak', 'YENİ', 'new');
          if (info.animate && i === 1) {
            DP.$$('.uml-class[data-id=HavaLojistigi], .uml-class[data-id=Ucak]', diagHost).forEach((g) => DP.flash(g, 'is-entering'));
          }
        }
        if (i >= 2) OLD_CLASSES.forEach((c) => diagram.badge(c, '✓ değişmedi', 'same'));
        if (i === 1) diagram.focus({ classes: ['HavaLojistigi', 'Ucak'], edges: ['gen-hava', 'real-ucak', 'cr-hava'] });
        // Son adımda karşılaştırma tablosu paneli kaplar.
        diagHost.hidden = i === 3;
        renderImpact(i);
      },
    });
    ex.paintAll();
    return ui.stepApi(stepper, { destroy: () => stepper.destroy() });
  };

  // ================================================================== 7. GERÇEK DÜNYA
  const RW = [
    {
      tab: 'Iterator (JDK)',
      title: '`Collection.iterator()` — her koleksiyon kendi yineleyicisini üretir',
      intro: '`iterator()` metodu `Iterable` arayüzünde bildirilmiş bir **fabrika metodudur**. Her koleksiyon sınıfı onu kendine göre gerçekler ve kendi somut `Iterator` nesnesini döndürür.',
      map: [
        ['creator', 'Lojistik', '`Iterable<T>` / `Collection<E>`'],
        ['fm', 'aracOlustur()', '`iterator()`'],
        ['concreteCreator', 'KaraLojistigi', '`ArrayList`, `HashSet`, `TreeSet` …'],
        ['product', 'TasimaAraci', '`Iterator<E>`'],
        ['concreteProduct', 'Kamyon', '`ArrayList$Itr` (private iç sınıf!)'],
      ],
      note: 'Somut ürün sınıfı **private** bir iç sınıftır: istemci onun adını yazamaz bile! Gevşek bağlılığın en güzel örneği.',
      roles: { Iterable: 'creator', Collection: 'creator', Iterator: 'product', ArrayList: 'concreteCreator', LinkedList: 'concreteCreator', HashSet: 'concreteCreator', TreeSet: 'concreteCreator', ArrayDeque: 'concreteCreator' },
      special: { iterator: 'fm' },
      file: 'IteratorOrnegi.java',
      code: (o) => `import java.util.*;

public class IteratorOrnegi {

    public static void main(String[] args) {
        yazdir(new ${o}<>(List.of("elma", "armut")));
    }

    // İstemci yalnızca Collection ve Iterator arayüzlerini tanır.
    static void yazdir(Collection<String> koleksiyon) {
        Iterator<String> it = koleksiyon.iterator();   // ← FABRİKA METODU
        System.out.println(it.getClass().getName());   // somut ürün hangisi?
        while (it.hasNext()) {
            System.out.println("  " + it.next());
        }
    }
}`,
      mark: 'koleksiyon.iterator()',
      options: [
        { label: 'ArrayList', arg: 'ArrayList', out: ['java.util.ArrayList$Itr', '  elma', '  armut'] },
        { label: 'LinkedList', arg: 'LinkedList', out: ['java.util.LinkedList$ListItr', '  elma', '  armut'] },
        { label: 'HashSet', arg: 'HashSet', out: ['java.util.HashMap$KeyIterator', '  elma', '  armut'] },
        { label: 'TreeSet', arg: 'TreeSet', out: ['java.util.TreeMap$KeyIterator', '  armut', '  elma'] },
        { label: 'ArrayDeque', arg: 'ArrayDeque', out: ['java.util.ArrayDeque$DeqIterator', '  elma', '  armut'] },
      ],
      cmd: '$ java IteratorOrnegi',
    },
    {
      tab: 'JDBC',
      title: '`Connection.createStatement()` — her sürücü kendi komut nesnesini üretir',
      intro: 'JDBC’de `Connection` arayüzünün `createStatement()` metodu bir fabrika metodudur. Her veritabanı sürücüsü kendi `Connection` ve `Statement` sınıflarını getirir; sizin kodunuz yalnızca arayüzleri bilir.',
      map: [
        ['creator', 'Lojistik', '`java.sql.Connection` (arayüz)'],
        ['fm', 'aracOlustur()', '`createStatement()`'],
        ['concreteCreator', 'KaraLojistigi', '`PgConnection`, `ConnectionImpl` …'],
        ['product', 'TasimaAraci', '`java.sql.Statement`'],
        ['concreteProduct', 'Kamyon', '`PgStatement`, `StatementImpl` …'],
      ],
      note: 'Burada Creator bir **arayüz**: Factory Method soyut sınıf yerine arayüzle de kurulabilir. (Çıktı, ilgili sürücü classpath’teyken alınan örnek çıktıdır; sürücü sürümüne göre değişebilir.)',
      roles: { Connection: 'creator', Statement: 'product', DriverManager: 'client' },
      special: { createStatement: 'fm' },
      file: 'JdbcOrnegi.java',
      code: (o) => `import java.sql.*;

public class JdbcOrnegi {

    public static void main(String[] args) throws SQLException {
        String url = "${o}";

        // Hangi sürücü (somut yaratıcı)? Bağlantı URL'si belirler.
        try (Connection baglanti = DriverManager.getConnection(url, "ogr", "sifre")) {

            Statement komut = baglanti.createStatement();   // ← FABRİKA METODU
            System.out.println(baglanti.getClass().getName());
            System.out.println(komut.getClass().getName());
        }
    }
}`,
      mark: 'baglanti.createStatement()',
      options: [
        { label: 'PostgreSQL', arg: 'jdbc:postgresql://localhost/okul', out: ['org.postgresql.jdbc.PgConnection', 'org.postgresql.jdbc.PgStatement'] },
        { label: 'MySQL', arg: 'jdbc:mysql://localhost/okul', out: ['com.mysql.cj.jdbc.ConnectionImpl', 'com.mysql.cj.jdbc.StatementImpl'] },
        { label: 'H2', arg: 'jdbc:h2:mem:okul', out: ['org.h2.jdbc.JdbcConnection', 'org.h2.jdbc.JdbcStatement'] },
      ],
      cmd: '$ java -cp .;surucu.jar JdbcOrnegi',
    },
    {
      tab: 'URL bağlantıları',
      title: '`URLStreamHandler.openConnection()` — ders kitabındaki gibi bir fabrika metodu',
      intro: '`java.net.URLStreamHandler` soyut sınıfının `openConnection(URL)` metodu **protected abstract**’tır. Her protokolün `Handler` alt sınıfı onu override eder ve kendi bağlantı nesnesini üretir. `url.openConnection()` çağrısı işi bu fabrika metoduna devreder.',
      map: [
        ['creator', 'Lojistik', '`URLStreamHandler` (soyut sınıf)'],
        ['fm', 'aracOlustur()', '`openConnection(URL)`'],
        ['concreteCreator', 'KaraLojistigi', '`…protocol.http.Handler`, `…protocol.file.Handler`'],
        ['product', 'TasimaAraci', '`URLConnection`'],
        ['concreteProduct', 'Kamyon', '`HttpURLConnection`, `FileURLConnection` …'],
      ],
      note: 'Çıktılar Java 21 ile alındı. Sınıf adları `sun.net.www.protocol` paketindendir: JDK’nın iç gerçekleştirimleri.',
      roles: { URLStreamHandler: 'creator', URLConnection: 'product', URL: 'client', URI: 'client' },
      special: { openConnection: 'fm' },
      file: 'UrlOrnegi.java',
      code: (o) => `import java.net.*;

public class UrlOrnegi {

    public static void main(String[] args) throws Exception {
        URL url = URI.create("${o}").toURL();

        // URL, işi protokolün Handler nesnesine devreder:
        // handler.openConnection(url)  ← FABRİKA METODU
        URLConnection baglanti = url.openConnection();
        System.out.println(baglanti.getClass().getName());
    }
}`,
      extraFile: {
        name: 'URLStreamHandler.java',
        code: `// JDK'dan sadeleştirilmiş: java.net.URLStreamHandler
public abstract class URLStreamHandler {

    // FABRİKA METODU: Her protokol kendi bağlantı nesnesini üretir.
    protected abstract URLConnection openConnection(URL u) throws IOException;
}`,
      },
      mark: 'url.openConnection()',
      options: [
        { label: 'https', arg: 'https://ornek.com', out: ['sun.net.www.protocol.https.HttpsURLConnectionImpl'] },
        { label: 'http', arg: 'http://ornek.com', out: ['sun.net.www.protocol.http.HttpURLConnection'] },
        { label: 'file', arg: 'file:///C:/notlar.txt', out: ['sun.net.www.protocol.file.FileURLConnection'] },
        { label: 'jar', arg: 'jar:file:/C:/kutuphane.jar!/ayar.txt', out: ['sun.net.www.protocol.jar.JarURLConnection'] },
      ],
      cmd: '$ java UrlOrnegi',
    },
    {
      tab: 'Karıştırmayın!',
      title: 'Adında “factory” geçen her şey Factory Method değildir',
      intro: 'Sınavlarda en çok karıştırılan kavramlar. **Factory Method kalıtıma dayanır**: kararı, override edilen bir metot verir.',
      extraHtml: `<table class="cmp cmp-3">
        <thead><tr><th></th><th>Basit Fabrika</th><th>Factory Method</th><th>Abstract Factory</th></tr></thead>
        <tbody>
          <tr><td>Mekanizma</td><td>Tek sınıfta koşul (<code>switch</code>)</td><td><b>Kalıtım + override</b></td><td>Kompozisyon (fabrika nesnesi)</td></tr>
          <tr><td>Ne üretir?</td><td>Tek ürün</td><td>Tek ürün</td><td>İlişkili ürün <b>ailesi</b></td></tr>
          <tr><td>Yeni tür eklemek</td><td class="bad">Fabrika sınıfı değişir</td><td class="ok">Yeni alt sınıf eklenir</td><td class="ok">Yeni fabrika sınıfı eklenir</td></tr>
          <tr><td>GoF kalıbı mı?</td><td class="bad">Hayır (deyim)</td><td class="ok">Evet</td><td class="ok">Evet</td></tr>
        </tbody></table>`,
      note: '`Calendar.getInstance()` bir **statik fabrika metodudur** (Effective Java, Madde 1): yararlı bir deyimdir ama statik metotlar override edilemediği için GoF Factory Method değildir. Java 21’de `java.util.GregorianCalendar` döndürür.',
      roles: { TasimaAraci: 'product', Kamyon: 'concreteProduct', Gemi: 'concreteProduct' },
      special: {},
      file: 'Karsilastirma.java',
      code: () => `// 1) Statik fabrika metodu — yararlı bir deyim, GoF kalıbı DEĞİL
LocalDate tarih    = LocalDate.of(2026, 10, 13);
List<String> liste = List.of("a", "b");
Calendar takvim    = Calendar.getInstance();   // → GregorianCalendar

// 2) Basit Fabrika (Simple Factory) — GoF kalıbı DEĞİL
class AracFabrikasi {
    static TasimaAraci olustur(String tur) {
        return switch (tur) {
            case "kara"  -> new Kamyon();
            case "deniz" -> new Gemi();
            default -> throw new IllegalArgumentException(tur);
        };
    }
}`,
    },
  ];

  FM.scenes.realworld = (root, ctx) =>
    kit.realWorldScene(root, ctx, {
      tabs: RW,
      roles: FM.roles,
      roleOf: FM.roleOf,
      footText: (i) =>
        i < 3
          ? 'Kendi örneğimizdeki rolleri Java kütüphanesinde bulun. Sağdaki düğmelerle farklı somut yaratıcıları deneyin: **istemci kodu hiç değişmeden** farklı somut ürünler oluşuyor.'
          : 'Factory Method’u benzer adlı kavramlardan ayırt etmek sınavda puan kazandırır.',
    });

  // ================================================================== 8. QUIZ
  const Q = [
    {
      type: 'mcq',
      q: 'Factory Method kalıbında hangi nesnenin oluşturulacağına **kim** karar verir?',
      options: ['İstemci ([[Main]])', 'Yaratıcı ([[Lojistik]])', 'Somut yaratıcı alt sınıflar ([[KaraLojistigi]], [[DenizLojistigi]])', 'Ürün arayüzü ([[TasimaAraci]])'],
      answer: 2,
      explain: 'Yaratıcı, fabrika metodunu soyut bırakır; somut alt sınıflar onu override ederek hangi ürünün üretileceğini belirler. GoF: “hangi sınıfın örnekleneceğine **alt sınıflar** karar versin.”',
    },
    {
      type: 'line',
      q: 'Aşağıdaki kodda **hangi aracın üretileceğine karar verilen** satıra tıklayın.',
      codeName: 'KaraLojistigi.java',
      code: FM.code.creator(FM.variants.kara),
      answer: 'return new Kamyon();',
      explain: 'Somut ürünün adı yalnızca somut yaratıcının fabrika metodunda geçer: `return new Kamyon();`',
    },
    {
      type: 'mcq',
      q: '`teslimatPlanla()` içindeki `arac` değişkeninin **derleme zamanındaki (statik) tipi** nedir?',
      options: ['[[Kamyon]]', '[[TasimaAraci]]', '[[KaraLojistigi]]', '`Object`'],
      answer: 1,
      explain: 'Değişken `TasimaAraci` olarak bildirildi. Çalışma zamanında nesne bir Kamyon olabilir ama Lojistik bunu bilmez; bu sayede somut sınıflara bağımlı olmaz.',
    },
    {
      type: 'mcq',
      q: 'Hava taşımacılığını eklerken **mevcut hiçbir sınıfı değiştirmememiz** hangi SOLID ilkesine örnektir?',
      options: ['Tek Sorumluluk (SRP)', 'Açık/Kapalı (OCP)', 'Liskov Yerine Geçme (LSP)', 'Arayüz Ayrımı (ISP)'],
      answer: 1,
      explain: 'Yazılım birimleri **genişlemeye açık, değişikliğe kapalı** olmalıdır. Yeni davranışı yeni sınıflar ekleyerek kazandık.',
    },
    {
      type: 'mcq',
      q: 'Aşağıdakilerden hangisi Factory Method’un bir **dezavantajıdır**?',
      options: ['İstemci somut ürün sınıflarına bağımlı hâle gelir', 'Her yeni ürün için yeni bir yaratıcı alt sınıfı gerekebilir; sınıf sayısı artar', 'Ürünler ortak bir arayüze sahip olamaz', 'Çalışma zamanında polimorfizm kullanılamaz'],
      answer: 1,
      explain: 'Paralel sınıf hiyerarşileri büyür. Tek bir ürün türü olan basit senaryolarda bu ek karmaşıklık gereksiz olabilir.',
    },
    {
      type: 'mcq',
      q: '`ArrayList` sınıfının `iterator()` metodu düşünüldüğünde, `ArrayList` Factory Method’daki hangi role karşılık gelir?',
      options: ['Product (Ürün)', 'ConcreteProduct (Somut Ürün)', 'ConcreteCreator (Somut Yaratıcı)', 'Client (İstemci)'],
      answer: 2,
      explain: '`iterator()` fabrika metodudur; `ArrayList` onu gerçekleyerek kendi somut ürününü (`ArrayList$Itr`) üretir. Ürün arayüzü `Iterator`’dır.',
    },
    {
      type: 'mcq',
      q: '`Calendar.getInstance()` için hangisi doğrudur?',
      options: ['GoF Factory Method’un klasik örneğidir', 'Statik fabrika metodudur; alt sınıfların override etmesine dayanmaz', 'Abstract Factory kalıbıdır', 'Singleton’dır; hep aynı nesneyi döndürür'],
      answer: 1,
      explain: 'Statik metotlar override edilemez. `getInstance()` yararlı bir *statik fabrika metodu* deyimidir ama kalıtıma dayanan GoF Factory Method değildir. Her çağrıda yeni bir nesne döner.',
    },
    {
      type: 'mcq',
      q: 'Factory Method ile Abstract Factory arasındaki **temel fark** hangisidir?',
      options: [
        'Factory Method kalıtımla **tek bir ürün** üretir; Abstract Factory nesne kompozisyonuyla **ilişkili ürün aileleri** üretir',
        'Factory Method yalnızca statik metotlarla çalışır',
        'Abstract Factory arayüz kullanmaz',
        'İkisi aynı kalıbın farklı adlarıdır',
      ],
      answer: 0,
      explain: 'Abstract Factory’nin içindeki her “oluştur” metodu çoğu zaman bir fabrika metodudur; fark, ürün ailesi ve kompozisyondur.',
    },
  ];

  FM.scenes.quiz = (root, ctx) =>
    kit.quizScene(root, ctx, {
      questions: Q,
      roleOf: FM.roleOf,
      special: FM.special,
      patternName: 'Factory Method',
      match: {
        items: ['Lojistik', 'KaraLojistigi', 'DenizLojistigi', 'TasimaAraci', 'Kamyon', 'Gemi', 'Main'].map((id) => ({ id, label: id })),
        buckets: ['client', 'creator', 'concreteCreator', 'product', 'concreteProduct'].map((k) => ({ id: k, title: FM.roles[k].en, sub: FM.roles[k].tr, color: FM.roles[k].color })),
        answer: FM.classRoles,
        hint: 'Yedi sınıfı beş role yerleştirin. Takıldığınızda **Cevapları göster** düğmesi var.',
      },
    });

  // ================================================================== 9. ÖZET
  FM.scenes.summary = function (root, ctx) {
    const el = h('div', { class: 'scene scene-summary' });
    el.innerHTML = `
      <div class="sum-head">
        <div>
          <div class="chips"><span class="chip chip-cat">Yaratımsal · Creational</span><span class="chip">Diğer adı: Virtual Constructor</span></div>
          <h1>Factory Method — Özet</h1>
        </div>
        <div class="sum-actions no-print">
          <button class="btn btn-ghost" type="button" data-print>🖨 Yazdır / PDF</button>
          ${DP.patterns['abstract-factory'] ? '<a class="btn btn-primary" href="#/abstract-factory">Sıradaki kalıp: Abstract Factory →</a>' : ''}
        </div>
      </div>
      <div class="sum-grid">
        <article class="card sum-intent">
          <h3>Amaç</h3>
          <p>Nesne oluşturmak için bir arayüz tanımla; <b>hangi sınıfın örnekleneceğine alt sınıflar karar versin</b>.</p>
          <div class="sum-formula"><code>Creator.someOperation()</code> → <code class="tk-fm">factoryMethod()</code> → <code>ConcreteCreator</code> → <code>new ConcreteProduct()</code></div>
        </article>
        <article class="card sum-uml"><h3>Yapı</h3><div class="sum-diag"></div></article>
        <article class="card">
          <h3>Ne zaman kullanılır?</h3>
          <ul>
            <li>Bir sınıf, oluşturması gereken nesnelerin sınıfını <b>önceden bilemiyorsa</b>,</li>
            <li>Bir sınıf, oluşturacağı nesneleri <b>alt sınıflarının belirlemesini</b> istiyorsa,</li>
            <li>Bir kütüphane/çatı (framework) kullanıcısına, iç bileşenleri <b>genişletme kancası</b> sunmak istiyorsanız.</li>
          </ul>
        </article>
        <article class="card">
          <h3>Katılımcılar</h3>
          <ul class="sum-roles">
            <li>${ui.roleChip('product')} oluşturulan nesnelerin arayüzü</li>
            <li>${ui.roleChip('concreteProduct')} ürünün gerçekleştirimi</li>
            <li>${ui.roleChip('creator')} fabrika metodunu bildirir ve kullanır</li>
            <li>${ui.roleChip('concreteCreator')} fabrika metodunu override eder</li>
          </ul>
        </article>
        <article class="card sum-pros">
          <h3>Artıları</h3>
          <ul>
            <li><b>OCP:</b> yeni ürün = yeni sınıf, eski kod değişmez</li>
            <li><b>Gevşek bağlılık:</b> yaratıcı somut ürünleri tanımaz (DIP)</li>
            <li><b>SRP:</b> üretim kodu tek bir yerde toplanır</li>
            <li><b>Test edilebilirlik:</b> test alt sınıfı sahte (mock) ürün üretebilir</li>
          </ul>
        </article>
        <article class="card sum-cons">
          <h3>Eksileri</h3>
          <ul>
            <li>Sınıf sayısı artar (paralel hiyerarşiler)</li>
            <li>Yalnızca ürün üretmek için alt sınıf yazmak gerekebilir</li>
            <li>Tek ürünlü basit durumlarda gereksiz karmaşıklık</li>
          </ul>
        </article>
        <article class="card">
          <h3>İlişkili kalıplar</h3>
          <ul>
            <li><b>Template Method:</b> fabrika metodu çoğu zaman bir şablon metodun içinden çağrılır (bizim <code>teslimatPlanla()</code> gibi).</li>
            <li><b>Abstract Factory:</b> genellikle bir grup fabrika metoduyla gerçeklenir.</li>
            <li><b>Prototype:</b> alt sınıf gerektirmeyen alternatif (klonlama).</li>
            <li><b>Iterator:</b> <code>iterator()</code> bir fabrika metodudur.</li>
          </ul>
        </article>
        <article class="card sum-tip">
          <h3>Kod kokusu → kalıp</h3>
          <p>İş mantığının ortasında şunu görüyorsanız Factory Method’u düşünün:</p>
          <pre class="mini-code">if (tur.equals("kara"))  arac = new Kamyon();
else if (tur.equals("deniz")) arac = new Gemi();</pre>
          <p class="exam"><b>Sınav ipucu:</b> Factory Method = <u>kalıtım + override</u> · Abstract Factory = <u>kompozisyon + ürün ailesi</u></p>
        </article>
        <article class="card sum-files">
          <h3>Java kodları</h3>
          <p>Çalıştırılabilir örnekler proje klasöründe:</p>
          <pre class="mini-code">java/factorymethod/cozum   → kalıplı çözüm
java/factorymethod/sorun   → kalıpsız sürüm 3.0</pre>
          <p>Derleyip çalıştırmak için <code>java/README.md</code> dosyasına bakın.</p>
        </article>
      </div>`;
    root.appendChild(el);
    el.querySelector('[data-print]').addEventListener('click', () => window.print());
    const spec = FM.diagram({});
    spec.classes = spec.classes.filter((c) => !c.hidden); // özet için yalnızca iki somut çift
    const diag = new DP.ClassDiagram(el.querySelector('.sum-diag'), spec, { roles: FM.roles, roleTags: false, mode: 'generic' });
    diag.svg.classList.add('is-compact');
    return { destroy() {} };
  };

  // ================================================================== kayıt
  DP.register({
    id: 'factory-method',
    name: 'Factory Method',
    tr: 'Fabrika Metodu',
    category: 'creational',
    roleOf: FM.roleOf,
    initialState: () => ({
      variant: 'kara',
      cargo: { kara: FM.variants.kara.cargo, deniz: FM.variants.deniz.cargo, hava: FM.variants.hava.cargo },
      havaUnlocked: false,
      view: 'stage',
      showCode: true,
      ext: {},
      quiz: { results: {}, match: false },
    }),
    scenes: [
      { id: 'giris', title: 'Giriş', mount: FM.scenes.intro },
      { id: 'sorun', title: 'Sorun', mount: FM.scenes.problem },
      { id: 'cozum', title: 'Çözüm', mount: FM.scenes.solution },
      { id: 'yapi', title: 'Yapı (UML)', mount: FM.scenes.structure },
      { id: 'akis', title: 'Canlı Akış', mount: FM.scenes.flow, star: true },
      { id: 'genislet', title: 'Genişlet', mount: FM.scenes.extend },
      { id: 'gercek', title: 'Gerçek Dünya', mount: FM.scenes.realworld },
      { id: 'quiz', title: 'Quiz', mount: FM.scenes.quiz },
      { id: 'ozet', title: 'Özet', mount: FM.scenes.summary },
    ],
  });
})();
