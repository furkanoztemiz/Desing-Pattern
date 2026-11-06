// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.akis.listele;

/**
 * «Leaf» — Ürün: içinde başka parça yok; soruyu kendisi cevaplar.
 */
public class Urun implements Parca {

    private final String ad;
    private final int gram;

    public Urun(String ad, int gram) {
        this.ad = ad;
        this.gram = gram;
    }

    @Override
    public int agirlik() {
        return gram;
    }

    @Override
    public void listele(String girinti) {
        System.out.println(girinti + "- " + ad + " (" + gram + " g)");
    }
}
