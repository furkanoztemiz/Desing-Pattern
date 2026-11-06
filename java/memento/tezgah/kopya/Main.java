// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.tezgah.kopya;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        YedekDefteri defter = new YedekDefteri(depo);

        defter.kaydet("09:00");
        depo.yukle("KRG-1001");
        depo.tasi("KRG-1004", "C2");
        depo.yukle("KRG-1005");
        defter.geriYukle("09:00");
        System.out.println(depo.durum());
    }
}
