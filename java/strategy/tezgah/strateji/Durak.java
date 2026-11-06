// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tezgah.strateji;

import java.util.List;

/**
 * Günün bir teslimat durağı. gunun() listesi randevu sırasındadır.
 */
public record Durak(String no, String alici, String yer,
                    int x, int y, int kg, boolean soguk) {

    public static List<Durak> gunun() {
        return List.of(
            new Durak("KRG-1001", "Ali Şahin", "Çarşı", 6, 4, 3, false),
            new Durak("KRG-1004", "Can Demir", "Battalgazi", 9, 1, 4, false),
            new Durak("KRG-1005", "Selin Aydın", "Üniversite", 11, 4, 9, false),
            new Durak("KRG-1006", "Mert Kaya", "Yeşilyurt", 2, 7, 25, false),
            new Durak("KRG-1007", "Elif Arslan", "Kernek", 3, 4, 1, true),
            new Durak("KRG-1008", "Emre Koç", "Bostanbaşı", 6, 7, 2, true));
    }

    public Konum konum() {
        return new Konum(x, y);
    }

    @Override
    public String toString() {
        String not = soguk ? ", soğuk zincir" : "";
        return no + " " + alici + " (" + yer + not + ")";
    }
}
