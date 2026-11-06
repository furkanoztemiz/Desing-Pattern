// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.genislet;

/**
 * «ConcreteState» — Dolu dolap: doğru kod kapağı açar; üçüncü hatalı kod dolabı kilitler.
 */
public class DoluDurum implements DolapDurumu {

    @Override
    public void paketKoy(KargoDolabi dolap, String koli, String kod) {
        System.out.println("  dolu: " + koli + " konamadı");
    }

    @Override
    public void kodGir(KargoDolabi dolap, String girilen) {
        if (dolap.kodDogruMu(girilen)) {
            String koli = dolap.paketiVer();
            System.out.println("  kapak açıldı: " + koli + " teslim edildi");
            dolap.durumDegistir(new BosDurum());
        } else {
            int hatali = dolap.hataliArtir();
            System.out.println("  hatalı kod (" + hatali + "/3)");
            if (hatali == 3) {
                dolap.durumDegistir(new KilitliDurum());
            }
        }
    }

    @Override
    public void gorevliAc(KargoDolabi dolap) {
        System.out.println("  dolap kilitli değil");
    }

    @Override
    public String ad() {
        return "DOLU";
    }
}
