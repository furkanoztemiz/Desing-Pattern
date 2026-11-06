// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.akis.yakin;

public class Main {

    public static void main(String[] args) {
        System.out.println("~ en yakın durak");
        Kurye kurye = new Kurye(Durak.gunun(), new EnYakinRota());
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        kurye.teslimEt();
        System.out.println(kurye.ozet());
    }
}
