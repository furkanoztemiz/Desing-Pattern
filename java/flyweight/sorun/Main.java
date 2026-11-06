// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.sorun;

public class Main {

    public static void main(String[] args) {
        Harita harita = new Harita();
        harita.ekle("KRG-1001", 521, 215, "koli");          // Ali · Malatya
        harita.ekle("KRG-1002", 306, 135, "zarf");          // Ayşe · Ankara
        harita.ekle("KRG-1003", 81, 212, "koli");           // Zeynep · İzmir
        Gonderiler.ekle(harita, 9_997);                     // bütün Türkiye
        harita.ciz();
        System.out.println(harita.ozet());
    }
}
