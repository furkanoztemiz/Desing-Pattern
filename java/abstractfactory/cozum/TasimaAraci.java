// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «AbstractProduct A» — Soyut Ürün: araç
 */
public interface TasimaAraci {

    String gerekenBelge();   // bu araç hangi belgeyle yola çıkabilir?

    void teslimEt(String yuk);
}
