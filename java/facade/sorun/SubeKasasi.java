// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.sorun;

/**
 * Şube kasası: gönderiyi kabul eden görevlinin ekranı. Yedi alt sistemi kendisi yönetir.
 */
public class SubeKasasi {

    private final AdresServisi adres;
    private final TarifeServisi tarife;
    private final OdemeServisi odeme;
    private final TakipNoServisi takip;
    private final EtiketServisi etiket;
    private final KuryeServisi kurye;
    private final BildirimServisi sms;

    public SubeKasasi(AdresServisi adres, TarifeServisi tarife, OdemeServisi odeme,
            TakipNoServisi takip, EtiketServisi etiket, KuryeServisi kurye, BildirimServisi sms) {
        this.adres = adres;
        this.tarife = tarife;
        this.odeme = odeme;
        this.takip = takip;
        this.etiket = etiket;
        this.kurye = kurye;
        this.sms = sms;
    }

    public void gonder(Talep t) {
        System.out.println("[Kasa] " + t.musteri() + ": " + t.kg() + " kg, " + t.adres() + "/" + t.il());
        String tamAdres = adres.dogrula(t.adres(), t.il());
        int tutar = tarife.hesapla(t.kg());
        if (!odeme.cek(t.musteri(), tutar)) {               // kart limiti: reddedilirse DUR
            sms.gonder(t.musteri(), "ödeme alınamadı, gönderi oluşturulmadı");
            System.out.println("[Kasa] gönderi oluşturulmadı");
            return;
        }
        String no = takip.yeni();
        etiket.bas(no, tamAdres);
        kurye.ata(no, t.il());
        sms.gonder(t.musteri(), no + " gönderiniz alındı");
        System.out.println("[Kasa] fiş: " + no);
    }
}
