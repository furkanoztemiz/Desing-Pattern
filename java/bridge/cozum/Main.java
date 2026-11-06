// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.cozum;

public class Main {

    public static void main(String[] args) {
        Gonderi kitap = new Gonderi("KRG-1001", "Ali Şahin");
        Gonderi vazo = new Gonderi("KRG-1002", "Ayşe Yılmaz");

        Yazici zebra = new ZebraYazici();

        new Etiket(zebra).yazdir(kitap);
        new KirilacakEtiket(zebra).yazdir(vazo);    // ^CI28 artık burada da var
    }
}
