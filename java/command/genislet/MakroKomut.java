// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.genislet;

import java.util.List;

/**
 * «ConcreteCommand» — Birçok komutu tek komut gibi çalıştırır; tek "geri al" hepsini ters sırayla geri alır.
 */
public class MakroKomut implements Komut {

    private final String ad;
    private final List<Komut> komutlar;

    public MakroKomut(String ad, List<Komut> komutlar) {
        this.ad = ad;
        this.komutlar = komutlar;
    }

    @Override
    public void calistir() {
        for (Komut k : komutlar) {
            k.calistir();
        }
    }

    @Override
    public void geriAl() {
        for (int i = komutlar.size() - 1; i >= 0; i--) {    // ters sırayla
            komutlar.get(i).geriAl();
        }
    }

    @Override
    public String ad() {
        return "MAKRO " + ad + " (" + komutlar.size() + " komut)";
    }
}
