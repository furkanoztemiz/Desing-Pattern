// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.tezgah.kalipsiz;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();
        OperatorPaneli panel = new OperatorPaneli(depo, kamyon);

        panel.tikla("TASI", "KRG-1001", "B3");
        panel.tikla("YUKLE", "KRG-1003", null);
        panel.geriAl();
        panel.geriAl();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
