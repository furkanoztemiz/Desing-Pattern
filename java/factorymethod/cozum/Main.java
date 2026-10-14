// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.cozum;

public class Main {

    public static void main(String[] args) {
        musteriKodu(new KaraLojistigi(), "20 ton kayısı");
        musteriKodu(new DenizLojistigi(), "300 konteyner fındık");
        musteriKodu(new HavaLojistigi(), "acil ilaç kolisi");   // genişletme: yeni tür
    }

    // İstemci kodu yalnızca soyut Lojistik tipini tanır.
    static void musteriKodu(Lojistik lojistik, String yuk) {
        lojistik.teslimatPlanla(yuk);
    }
}
