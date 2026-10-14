// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.cozum;

/**
 * «Client» — Sipariş masası.
 * Üreticiyi kendisi oluşturmaz; ona getInstance() ile ulaşır.
 */
public class SiparisServisi {

    public String siparisAl(String yuk) {
        String no = TakipNoUretici.getInstance().yeniNumara();
        System.out.println("[Sipariş] " + yuk + " için takip no: " + no);
        return no;
    }
}
