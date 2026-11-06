// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.genislet;

/**
 * «ConcreteState» — Bakımdaki dolap: hiçbir isteği kabul etmez; görevli açınca hizmete döner.
 */
public class HizmetDisiDurum implements DolapDurumu {

    @Override
    public void paketKoy(KargoDolabi dolap, String koli, String kod) {
        System.out.println("  hizmet dışı: " + koli + " konamadı");
    }

    @Override
    public void kodGir(KargoDolabi dolap, String girilen) {
        System.out.println("  hizmet dışı: kapak açılmaz");
    }

    @Override
    public void gorevliAc(KargoDolabi dolap) {
        System.out.println("  bakım bitti · dolap hizmette");
        dolap.durumDegistir(new BosDurum());
    }

    @Override
    public String ad() {
        return "HİZMET DIŞI";
    }
}
