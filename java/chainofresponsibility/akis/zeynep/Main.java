// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.akis.zeynep;

public class Main {

    public static void main(String[] args) {
        TeslimatAdimi istanbulZinciri = new AliciyaTeslim();
        istanbulZinciri.sonra(new DolabaTeslim())
                .sonra(new KomsuyaTeslim())
                .sonra(new SubeyeTeslim())
                .sonra(new GondericiyeIade());

        Kurye istanbul = new Kurye("İstanbul", istanbulZinciri);
        istanbul.teslimEt(Gonderi.ilac("KRG-1003", "Zeynep Güneş", 1, Kapi.KOMSU_EVDE));
    }
}
