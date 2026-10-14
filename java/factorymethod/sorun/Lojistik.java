// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.sorun;

public class Lojistik {

    public void teslimatPlanla(String yuk, String tur) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        if (tur.equals("kara")) {
            Kamyon kamyon = new Kamyon();
            kamyon.teslimEt(yuk);
        } else if (tur.equals("deniz")) {
            Gemi gemi = new Gemi();
            gemi.teslimEt(yuk);
        } else if (tur.equals("hava")) {
            Ucak ucak = new Ucak();
            ucak.teslimEt(yuk);
        }
    }
}
