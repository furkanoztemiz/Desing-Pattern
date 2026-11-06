// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.akis.iadetermal;

public class Main {

    public static void main(String[] args) {
        Gonderi iade = new Gonderi("KRG-1003", "Zeynep Güneş");

        Yazici yazici = new TermalYazici();                 // gerçekleştirim
        Etiket etiket = new IadeEtiketi(yazici);            // soyutlama + köprü

        etiket.yazdir(iade);
    }
}
