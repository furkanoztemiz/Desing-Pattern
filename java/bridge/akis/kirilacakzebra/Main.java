// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.akis.kirilacakzebra;

public class Main {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi("KRG-1002", "Ayşe Yılmaz");

        Yazici yazici = new ZebraYazici();                  // gerçekleştirim
        Etiket etiket = new KirilacakEtiket(yazici);        // soyutlama + köprü

        etiket.yazdir(vazo);
    }
}
