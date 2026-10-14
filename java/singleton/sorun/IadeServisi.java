// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.sorun;

public class IadeServisi {

    private final TakipNoUretici uretici = new TakipNoUretici();

    public String iadeAl(String yuk) {
        String no = uretici.yeniNumara();
        System.out.println("[İade] " + yuk + " için takip no: " + no);
        return no;
    }
}
