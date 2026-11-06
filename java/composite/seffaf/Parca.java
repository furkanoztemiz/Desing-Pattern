// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.seffaf;

/**
 * «Component» — Şeffaf tasarım: çocuk yönetimi de arayüzde; ürünler varsayılanı devralır.
 */
public interface Parca {

    int agirlik();                      // gram

    void listele(String girinti);

    default void ekle(Parca p) {
        throw new UnsupportedOperationException("Ürünün içine parça konamaz");
    }

    default void cikar(Parca p) {
        throw new UnsupportedOperationException("Üründen parça çıkarılamaz");
    }
}
