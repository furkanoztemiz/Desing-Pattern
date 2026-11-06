// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.akis.gun;

public class Main {

    public static void main(String[] args) {
        System.out.println("~ soğuk zincir önce");
        Kurye kurye = new Kurye(Durak.gunun(), new SogukOnceRota());
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println("~ randevu sırası");
        kurye.setStrateji(new RandevuRota());
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println(kurye.ozet());
    }
}
