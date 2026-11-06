// Bu dosya tools/export-java.js ile js/patterns/proxy/data.js içinden üretildi.
package proxy.akis.ali;

import java.util.Map;

/**
 * «RealSubject» — GlobalShip'in uzaktaki takip servisi: oturum açmak da her sorgu da yavaş ve ücretli.
 */
public class GlobalShipTakip implements TakipServisi {

    static int oturum;                      // ölçüm (özet için)
    static int sorgu;

    private static final Map<String, String> KAYITLAR = Map.of(
            "KRG-1001", "Dağıtımda (Ali Şahin, Battalgazi)",
            "KRG-1002", "Transfer merkezinde (Ayşe Yılmaz, Çankaya)",
            "KRG-1003", "Teslim edildi (Zeynep Güneş, Konak)");

    public GlobalShipTakip() {
        oturum++;
        System.out.println("[GlobalShip] oturum açıldı (1200 ms)");
    }

    @Override
    public String sorgula(String takipNo) {
        sorgu++;
        System.out.println("[GlobalShip] " + takipNo + " sorgulandı (800 ms, 25 kuruş)");
        return KAYITLAR.get(takipNo);
    }

    public static String ozet() {
        return "GlobalShip: " + oturum + " oturum, " + sorgu + " sorgu, "
                + (oturum * 1200 + sorgu * 800) + " ms, " + sorgu * 25 + " kuruş";
    }
}
