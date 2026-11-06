// Bu dosya tools/export-java.js ile js/patterns/flyweight/data.js içinden üretildi.
package flyweight.genislet;

public class Main {

    public static void main(String[] args) {
        Harita harita = new Harita();
        harita.ekle("KRG-1001", 521, 215, "koli");          // Ali · Malatya
        harita.ekle("Malatya Aktarma", 548, 236, new DepoIsareti("Malatya", 87));
        harita.ekle("KRG-1003", 81, 212, "koli");           // Zeynep · İzmir
        harita.ciz();
        System.out.println(harita.ozet());
    }
}
