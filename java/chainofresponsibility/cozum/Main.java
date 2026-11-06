// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.cozum;

public class Main {

    public static void main(String[] args) {
        TeslimatAdimi malatyaZinciri = new AliciyaTeslim();
        malatyaZinciri.sonra(new KomsuyaTeslim())
                .sonra(new DolabaTeslim())
                .sonra(new SubeyeTeslim())
                .sonra(new GondericiyeIade());

        TeslimatAdimi istanbulZinciri = new AliciyaTeslim();      // aynı sınıflar, başka sıra
        istanbulZinciri.sonra(new DolabaTeslim())
                .sonra(new KomsuyaTeslim())
                .sonra(new SubeyeTeslim())
                .sonra(new GondericiyeIade());

        Kurye malatya = new Kurye("Malatya", malatyaZinciri);
        Kurye istanbul = new Kurye("İstanbul", istanbulZinciri);
        for (Gonderi g : Gunluk.gonderiler()) {
            malatya.teslimEt(g);
        }
        for (Gonderi g : Gunluk.gonderiler()) {
            istanbul.teslimEt(g);
        }
    }
}
