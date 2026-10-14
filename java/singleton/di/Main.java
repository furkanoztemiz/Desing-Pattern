// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.di;

public class Main {

    public static void main(String[] args) {
        TakipNoUretici uretici = new TakipNoUretici(1000);   // tek nesne: BURADA, bir kez

        SiparisServisi siparis = new SiparisServisi(uretici);
        IadeServisi iade = new IadeServisi(uretici);

        siparis.siparisAl("20 ton kayısı");
        siparis.siparisAl("300 konteyner fındık");
        iade.iadeAl("hasarlı koli");
    }
}
