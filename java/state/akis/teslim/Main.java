// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.akis.teslim;

public class Main {

    public static void main(String[] args) {
        KargoDolabi dolap = new KargoDolabi();

        dolap.paketKoy("KRG-1006", "2694");     // kurye · Mert’in paketi
        dolap.paketKoy("KRG-1005", "7356");     // kurye · Selin’in paketi
        dolap.kodGir("2694");                   // Mert
        System.out.println(dolap.ozet());
    }
}
