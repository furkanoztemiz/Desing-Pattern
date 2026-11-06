// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.cozum;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();
        OperatorPaneli panel = new OperatorPaneli();

        panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));
        panel.yap(new YukleKomutu(depo, kamyon, "KRG-1003"));
        panel.geriAl();
        panel.geriAl();

        GeceIsi gece = new GeceIsi();
        gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1001"));
        gece.ekle(new TasiKomutu(depo, "KRG-1004", "C2"));
        gece.ekle(new YukleKomutu(depo, kamyon, "KRG-1005"));
        gece.calistir();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
