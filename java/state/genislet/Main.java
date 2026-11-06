// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.genislet;

public class Main {

    public static void main(String[] args) {
        KargoDolabi dolap = new KargoDolabi();

        dolap.gorevliAc();                      // şube görevlisi
        dolap.paketKoy("KRG-1006", "2694");     // kurye · Mert’in paketi
        dolap.gorevliAc();                      // şube görevlisi
        dolap.paketKoy("KRG-1006", "2694");     // kurye · Mert’in paketi
        dolap.kodGir("2694");                   // Mert
        System.out.println(dolap.ozet());
    }
}
