// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.sorun;

public class Main {

    public static void main(String[] args) {
        Gonderi kitap = new Gonderi("KRG-1001", "Ali Şahin");
        Gonderi vazo = new Gonderi("KRG-1002", "Ayşe Yılmaz");

        new ZebraStandartEtiket().yazdir(kitap);
        new ZebraKirilacakEtiket().yazdir(vazo);
    }
}
