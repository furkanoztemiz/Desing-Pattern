// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.genislet;

/**
 * «ConcreteState» — Boş dolap: paketi kabul eder ve DOLU durumuna geçer.
 */
public class BosDurum implements DolapDurumu {

    @Override
    public void paketKoy(KargoDolabi dolap, String koli, String kod) {
        dolap.paketiYerlestir(koli, kod);
        System.out.println("  " + koli + " kondu · kod SMS ile gönderildi");
        dolap.durumDegistir(new DoluDurum());
    }

    @Override
    public void kodGir(KargoDolabi dolap, String girilen) {
        System.out.println("  dolap boş");
    }

    @Override
    public void gorevliAc(KargoDolabi dolap) {
        System.out.println("  bakım için hizmet dışı bırakıldı");
        dolap.durumDegistir(new HizmetDisiDurum());
    }

    @Override
    public String ad() {
        return "BOŞ";
    }
}
