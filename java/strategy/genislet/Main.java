// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.genislet;

public class Main {

    public static void main(String[] args) {
        System.out.println("~ soğuk zincir önce");
        Kurye kurye = new Kurye(Durak.gunun(), new SogukOnceRota());
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println("~ ağır önce");
        kurye.setStrateji(new AgirOnceRota());
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println(kurye.ozet());
    }
}
