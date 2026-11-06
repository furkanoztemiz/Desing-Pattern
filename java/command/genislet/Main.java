// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.genislet;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        Kamyon kamyon = new Kamyon();
        OperatorPaneli panel = new OperatorPaneli();

        panel.yap(new MakroKomut("Malatya kamyonu", List.of(
                new YukleKomutu(depo, kamyon, "KRG-1001"),
                new YukleKomutu(depo, kamyon, "KRG-1005"),
                new YukleKomutu(depo, kamyon, "KRG-1006"))));
        panel.geriAl();
        System.out.println(depo.durum() + " · " + kamyon.durum());
    }
}
