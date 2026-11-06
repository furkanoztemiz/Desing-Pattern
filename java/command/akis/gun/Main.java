// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.akis.gun;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();
        OperatorPaneli panel = new OperatorPaneli();

        panel.yap(new TasiKomutu(depo, "KRG-1001", "B3"));
        panel.yap(new YukleKomutu(depo, kamyon, "KRG-1003"));
        panel.geriAl();
        panel.geriAl();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
