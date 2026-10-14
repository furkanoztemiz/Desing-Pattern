// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.cozum;

/**
 * Elle yazılmış küçük bir test koşucusu (JUnit gerekmez).
 * Kullanım:  java UreticiTesti A B   → testleri verilen sırayla çalıştırır.
 */
public class UreticiTesti {

    public static void main(String[] args) {
        String[] sira = args.length > 0 ? args : new String[] {"A", "B"};
        for (String test : sira) {
            if (test.equals("A")) siparisTesti();
            if (test.equals("B")) iadeTesti();
        }
    }

    // Test A: yeni bir sipariş KRG-1001 almalı
    static void siparisTesti() {
        String no = new SiparisServisi().siparisAl("test kolisi");
        kontrol("Test A (sipariş)", no);
    }

    // Test B: yeni bir iade KRG-1001 almalı
    static void iadeTesti() {
        String no = new IadeServisi().iadeAl("test iadesi");
        kontrol("Test B (iade)", no);
    }

    static void kontrol(String test, String no) {
        if (no.equals("KRG-1001")) {
            System.out.println("[GEÇTİ] " + test);
        } else {
            System.out.println("[KALDI] " + test + ": KRG-1001 bekleniyordu, " + no + " geldi");
        }
    }
}
