// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.akis.ayse;

public class Main {

    public static void main(String[] args) {
        TeslimatAdimi malatyaZinciri = new AliciyaTeslim();
        malatyaZinciri.sonra(new KomsuyaTeslim())
                .sonra(new DolabaTeslim())
                .sonra(new SubeyeTeslim())
                .sonra(new GondericiyeIade());

        Kurye malatya = new Kurye("Malatya", malatyaZinciri);
        malatya.teslimEt(Gonderi.koli("KRG-1002", "Ayşe Yılmaz", 2, Kapi.KOMSU_EVDE));
    }
}
