// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.sorun;

/**
 * Kurye: bütün teslim seçenekleri ve sıraları bu metotta.
 */
public class Kurye {

    public void teslimEt(Gonderi g) {
        String yer;
        if (g.kapi() == Kapi.ALICI_EVDE) {
            yer = "Alıcı";
        } else if (g.sogukZincir()) {                       // soğuk zincir: yalnızca şube
            yer = "Şube";
        } else if (g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10) {
            yer = "Komşu";
        } else if (g.kg() <= 5) {                           // soğuk değil: yukarıda elendi
            yer = "Dolap";
        } else if (g.kg() <= 20) {
            yer = "Şube";
        } else {
            yer = "İade";
        }
        System.out.println("[Malatya] " + g.etiket() + ": " + yer);
    }
}
