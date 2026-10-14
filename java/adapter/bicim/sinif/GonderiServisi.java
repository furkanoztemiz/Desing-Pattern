// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.sinif;

/**
 * «Client» — Gönderi servisi: yalnızca KargoFirmasi arayüzünü tanır.
 */
public class GonderiServisi {

    private final KargoFirmasi firma;

    public GonderiServisi(KargoFirmasi firma) {
        this.firma = firma;
    }

    public void gonder(String nereden, String nereye, int kg) {
        String takipNo = firma.gonderiOlustur(nereden, nereye, kg);
        System.out.println("Takip no: " + takipNo + " | durum: " + firma.durumSorgula(takipNo));
    }
}
