// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.tezgah.iadesiz;

public class Main {

    public static void main(String[] args) {
        TeslimatAdimi malatyaZinciri = new AliciyaTeslim();
        malatyaZinciri.sonra(new KomsuyaTeslim())
                .sonra(new DolabaTeslim())
                .sonra(new SubeyeTeslim());

        Kurye malatya = new Kurye("Malatya", malatyaZinciri);
        for (Gonderi g : Gunluk.gonderiler()) {
            malatya.teslimEt(g);
        }
    }
}
