// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.akis.gece;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();

        GeceIsi gece = new GeceIsi();
        gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1001"));
        gece.ekle(new TasiKomutu(depo, "KRG-1004", "C2"));
        gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1005"));
        gece.calistir();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
