// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.di;

/**
 * Bağımlılık enjeksiyonu (DI) sürümü: sıradan bir sınıf.
 * Programda tek nesne olmasını sınıf değil, Main (kurulum kodu) sağlar.
 */
public class TakipNoUretici {

    private int sayac;

    public TakipNoUretici(int sonNumara) {
        this.sayac = sonNumara;
        System.out.println("[Üretici] yeni nesne oluşturuldu (sayaç: " + sayac + ")");
    }

    public String yeniNumara() {
        sayac++;
        return "KRG-" + sayac;
    }
}
