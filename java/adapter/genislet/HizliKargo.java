// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.genislet;

/**
 * Yurt içi kargo firmamız: KargoFirmasi arayüzünü zaten uyguluyor.
 */
public class HizliKargo implements KargoFirmasi {

    private int sonNo = 1000;

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        String takipNo = "HK-" + (++sonNo);
        System.out.println("[HızlıKargo] " + takipNo + ": " + nereden + " > " + nereye + ", " + kg + " kg");
        return takipNo;
    }

    @Override
    public String durumSorgula(String takipNo) {
        return "Dağıtımda";
    }
}
