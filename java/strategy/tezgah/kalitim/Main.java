// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.kalitim;

public class Main {

    public static void main(String[] args) {
        System.out.println("~ soğuk zincir önce");
        Kurye kurye = new SogukOnceKuryesi(Durak.gunun());
        kurye.teslimEt();
        kurye.teslimEt();
        // istek: randevu sırası (yolu yok)
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println(kurye.ozet());
    }
}
