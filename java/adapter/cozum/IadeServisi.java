// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.cozum;

/**
 * «Client» — İade servisi: o da yalnızca KargoFirmasi arayüzünü tanır.
 */
public class IadeServisi {

    private final KargoFirmasi firma;

    public IadeServisi(KargoFirmasi firma) {
        this.firma = firma;
    }

    public void iadeAl(String musteriSehri, String depoSehri, int kg) {
        String takipNo = firma.gonderiOlustur(musteriSehri, depoSehri, kg);
        System.out.println("İade takip no: " + takipNo);
    }
}
