// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/**
 * «AbstractFactory» — Soyut Fabrika
 * Birbiriyle UYUMLU ürünlerden oluşan bir aile üretir.
 */
public interface LojistikFabrikasi {

    TasimaAraci aracOlustur();

    TasimaBelgesi belgeOlustur();
}
