// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.sorun;

public class Main {

    public static void main(String[] args) {
        Lojistik lojistik = new Lojistik();
        lojistik.teslimatPlanla("20 ton kayısı", "kara");
        lojistik.teslimatPlanla("300 konteyner fındık", "deniz");
        lojistik.teslimatPlanla("acil ilaç kolisi", "hava");
    }
}
