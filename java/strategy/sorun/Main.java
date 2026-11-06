// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.sorun;

public class Main {

    public static void main(String[] args) {
        Kurye kurye = new Kurye(Durak.gunun());
        System.out.println("~ soğuk zincir önce");
        kurye.yontemSec("SOGUK_ONCE");
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println("~ randevu sırası");
        kurye.yontemSec("RANDEVU");
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println(kurye.ozet());
    }
}
