// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.sorun;

public class Main {

    public static void main(String[] args) {
        SiparisServisi siparis = new SiparisServisi();
        IadeServisi iade = new IadeServisi();

        siparis.siparisAl("20 ton kayısı");
        siparis.siparisAl("300 konteyner fındık");
        iade.iadeAl("hasarlı koli");
    }
}
