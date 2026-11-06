// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.sorun;

public class Main {

    public static void main(String[] args) {
        KargoDolabi dolap = new KargoDolabi();

        dolap.paketKoy("KRG-1001", "4821");     // kurye · Ali’nin paketi
        dolap.kodGir("1111");                   // yabancı
        dolap.kodGir("2222");                   // yabancı
        dolap.kodGir("3333");                   // yabancı
        dolap.paketKoy("KRG-1005", "7356");     // kurye · Selin’in paketi
        dolap.gorevliAc();                      // şube görevlisi
        dolap.kodGir("4821");                   // Ali
        System.out.println(dolap.ozet());
    }
}
