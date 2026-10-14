// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.di;

public class SiparisServisi {

    private final TakipNoUretici uretici;

    public SiparisServisi(TakipNoUretici uretici) {   // bağımlılık dışarıdan verilir
        this.uretici = uretici;
    }

    public String siparisAl(String yuk) {
        String no = uretici.yeniNumara();
        System.out.println("[Sipariş] " + yuk + " için takip no: " + no);
        return no;
    }
}
