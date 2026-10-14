// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.cozum;

/**
 * «Client» — İade masası.
 * Sipariş masasıyla AYNI üreticiyi kullanır.
 */
public class IadeServisi {

    public String iadeAl(String yuk) {
        String no = TakipNoUretici.getInstance().yeniNumara();
        System.out.println("[İade] " + yuk + " için takip no: " + no);
        return no;
    }
}
