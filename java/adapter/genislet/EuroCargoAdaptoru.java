// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.genislet;

/**
 * «Adapter» — EuroCargo'yu KargoFirmasi arayüzüne uyarlar.
 */
public class EuroCargoAdaptoru implements KargoFirmasi {

    private final EuroCargoClient client;

    public EuroCargoAdaptoru(EuroCargoClient client) {
        this.client = client;
    }

    @Override
    public String gonderiOlustur(String nereden, String nereye, int kg) {
        return client.book(nereden + " > " + nereye, kg * 1000);    // kg → gram, iki şehir → tek rota
    }

    @Override
    public String durumSorgula(String takipNo) {
        return client.isDelivered(takipNo) ? "Teslim edildi" : "Yolda";
    }
}
