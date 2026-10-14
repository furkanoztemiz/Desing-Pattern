// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

/**
 * «Director» — Yönetici: hazır gönderi tariflerini bilir.
 * Hangi temsilin (paket, etiket, fiyat…) üretildiğini BİLMEZ; yalnızca adımları sırayla çağırır.
 */
public class GonderiYoneticisi {

    public void asiGonderisi(GonderiHazirlayici h) {
        h.nereden("İstanbul")
         .nereye("Van")
         .agirlik(4)
         .sogukZincir()
         .ekspres()
         .sigorta(20000);
    }

    public void vazoGonderisi(GonderiHazirlayici h) {
        h.nereden("Kütahya")
         .nereye("İzmir")
         .agirlik(12)
         .kirilgan()
         .sigorta(5000);
    }
}
