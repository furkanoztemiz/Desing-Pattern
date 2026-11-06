// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.sorun;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();
        OperatorPaneli panel = new OperatorPaneli(depo, kamyon);

        panel.tikla("TASI", "KRG-1001", "B3");
        panel.tikla("YUKLE", "KRG-1003", null);
        panel.geriAl();
        panel.geriAl();

        GeceIsi gece = new GeceIsi(depo, kamyon);
        gece.ekle("YUKLE KRG-1001");
        gece.ekle("TASI KRG-1004 C2");
        gece.ekle("YÜKLE KRG-1005");
        gece.calistir();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
