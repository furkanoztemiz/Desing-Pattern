// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.sorun;

public class Main {

    public static void main(String[] args) {
        Kurye malatya = new Kurye();
        for (Gonderi g : Gunluk.gonderiler()) {
            malatya.teslimEt(g);
        }
        IstanbulKuryesi istanbul = new IstanbulKuryesi();
        for (Gonderi g : Gunluk.gonderiler()) {
            istanbul.teslimEt(g);
        }
    }
}
