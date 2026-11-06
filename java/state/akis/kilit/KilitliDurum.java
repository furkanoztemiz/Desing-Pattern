// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.akis.kilit;

/**
 * «ConcreteState» — Kilitli dolap: paket de kod da kabul etmez; yalnızca görevli açar.
 */
public class KilitliDurum implements DolapDurumu {

    @Override
    public void paketKoy(KargoDolabi dolap, String koli, String kod) {
        System.out.println("  kilitli: " + koli + " konamadı");
    }

    @Override
    public void kodGir(KargoDolabi dolap, String girilen) {
        System.out.println("  kilitli: görevli bekleniyor");
    }

    @Override
    public void gorevliAc(KargoDolabi dolap) {
        dolap.hatalariSifirla();
        System.out.println("  görevli kilidi açtı");
        dolap.durumDegistir(new DoluDurum());
    }

    @Override
    public String ad() {
        return "KİLİTLİ";
    }
}
