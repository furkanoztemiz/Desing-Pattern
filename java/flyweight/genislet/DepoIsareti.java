// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.genislet;

/**
 * «UnsharedConcreteFlyweight» — Aktarma merkezi: her depo tek ve kendine özgü; paylaşılmaz.
 */
public class DepoIsareti implements Isaret {

    private final int doluluk;                  // yüzde: deponun KENDİ durumu
    private final Ikon foto;

    public DepoIsareti(String sehir, int doluluk) {
        this.doluluk = doluluk;
        this.foto = new Ikon("depo-" + sehir + ".png");   // her deponun kendi fotoğrafı
    }

    @Override
    public void ciz(int x, int y, String etiket) {
        System.out.println("[depo] " + etiket + " → (" + x + ", " + y + ") · " + foto + " · doluluk %" + doluluk);
    }
}
