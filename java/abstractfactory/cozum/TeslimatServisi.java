// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «Client» — İstemci
 * Yalnızca soyut fabrikayı ve soyut ürünleri tanır.
 */
public class TeslimatServisi {

    private final LojistikFabrikasi fabrika;   // kompozisyon: fabrika dışarıdan verilir

    public TeslimatServisi(LojistikFabrikasi fabrika) {
        this.fabrika = fabrika;
    }

    public void gonder(String yuk) {
        TasimaAraci arac = fabrika.aracOlustur();
        TasimaBelgesi belge = fabrika.belgeOlustur();   // aynı aileden!
        belge.hazirla(yuk);
        Gumruk.kontrolEt(arac, belge);
        arac.teslimEt(yuk);
    }
}
