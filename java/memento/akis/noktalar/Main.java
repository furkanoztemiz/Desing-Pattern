// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.akis.noktalar;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        YedekDefteri defter = new YedekDefteri(depo);

        defter.kaydet("09:00");
        depo.tasi("KRG-1001", "B3");
        defter.kaydet("10:00");
        depo.yukle("KRG-1003");
        defter.geriYukle("09:00");
        System.out.println(depo.durum());
    }
}
