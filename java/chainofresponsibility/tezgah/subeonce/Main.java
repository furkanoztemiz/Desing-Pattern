// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.subeonce;

public class Main {

    public static void main(String[] args) {
        TeslimatAdimi malatyaZinciri = new SubeyeTeslim();
        malatyaZinciri.sonra(new AliciyaTeslim())
                .sonra(new KomsuyaTeslim())
                .sonra(new DolabaTeslim())
                .sonra(new GondericiyeIade());

        Kurye malatya = new Kurye("Malatya", malatyaZinciri);
        for (Gonderi g : Gunluk.gonderiler()) {
            malatya.teslimEt(g);
        }
    }
}
