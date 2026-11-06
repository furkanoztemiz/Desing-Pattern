// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.sorun;

/**
 * İstanbul kuryesi: Kurye kopyalandı, dolap öne alındı.
 */
public class IstanbulKuryesi {

    public void teslimEt(Gonderi g) {
        String yer;
        if (g.kapi() == Kapi.ALICI_EVDE) {
            yer = "Alıcı";
        } else if (g.kg() <= 5) {                           // İstanbul: önce dolap (apartmanlar)
            yer = "Dolap";
        } else if (g.sogukZincir()) {                       // soğuk zincir: yalnızca şube
            yer = "Şube";
        } else if (g.kapi() == Kapi.KOMSU_EVDE && g.kg() <= 10) {
            yer = "Komşu";
        } else if (g.kg() <= 20) {
            yer = "Şube";
        } else {
            yer = "İade";
        }
        System.out.println("[İstanbul] " + g.etiket() + ": " + yer);
    }
}
