// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.genislet;

/**
 * «Adaptee» — EuroCargo'nun istemci kütüphanesi (üçüncü parti). Ağırlık GRAM, rota tek bir metin.
 */
public class EuroCargoClient {

    private int sira = 7730;

    public String book(String route, int grams) {
        String code = "EC/" + (++sira);
        System.out.println("[EuroCargo] " + code + " booked: " + route + ", " + grams + " g");
        return code;
    }

    public boolean isDelivered(String bookingCode) {
        return false;
    }
}
