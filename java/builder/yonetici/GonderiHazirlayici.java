// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

/**
 * «Builder» — Bir gönderiyi tarif eden adımlar.
 * Her ConcreteBuilder bu adımları kendi temsiline çevirir.
 */
public interface GonderiHazirlayici {

    GonderiHazirlayici nereden(String sehir);

    GonderiHazirlayici nereye(String sehir);

    GonderiHazirlayici agirlik(int kg);

    GonderiHazirlayici kirilgan();

    GonderiHazirlayici sogukZincir();

    GonderiHazirlayici ekspres();

    GonderiHazirlayici sigorta(int tutar);
}
