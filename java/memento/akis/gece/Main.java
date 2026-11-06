// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.akis.gece;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        YedekDefteri defter = new YedekDefteri(depo);

        defter.kaydet("02:00");                     // gece planından önce
        try {
            depo.yukle("KRG-1001");
            depo.tasi("KRG-1004", "C2");
            depo.yukle("KRG-1005");
            depo.tasi("KRG-1006", "C2");            // planlama hatası: C2 dolu
        } catch (IllegalStateException e) {
            System.out.println("[Gece] HATA: " + e.getMessage());
            defter.geriYukle("02:00");              // plan iptal: önceki hâle dön
        }
        System.out.println(depo.durum());
    }
}
