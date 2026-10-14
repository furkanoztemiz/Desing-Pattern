// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.di;

public class IadeServisi {

    private final TakipNoUretici uretici;

    public IadeServisi(TakipNoUretici uretici) {   // bağımlılık dışarıdan verilir
        this.uretici = uretici;
    }

    public String iadeAl(String yuk) {
        String no = uretici.yeniNumara();
        System.out.println("[İade] " + yuk + " için takip no: " + no);
        return no;
    }
}
