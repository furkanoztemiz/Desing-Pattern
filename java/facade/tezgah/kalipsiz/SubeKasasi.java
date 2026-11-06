// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.kalipsiz;

/**
 * Şube kasası: gönderiyi kabul eden görevlinin ekranı. Yedi alt sistemi kendisi yönetir.
 */
public class SubeKasasi {

    private final AdresServisi adres;
    private final TarifeServisi tarife;
    private final OdemeServisi odeme;
    private final TakipNoServisi takip;
    private final SigortaServisi sigorta;
    private final EtiketServisi etiket;
    private final KuryeServisi kurye;
    private final BildirimServisi sms;

    public SubeKasasi(AdresServisi adres, TarifeServisi tarife, OdemeServisi odeme,
            TakipNoServisi takip, SigortaServisi sigorta, EtiketServisi etiket, KuryeServisi kurye,
            BildirimServisi sms) {
        this.adres = adres;
        this.tarife = tarife;
        this.odeme = odeme;
        this.takip = takip;
        this.sigorta = sigorta;
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
        sigorta.police(no, tutar);
        etiket.bas(no, tamAdres);
        kurye.planla(no, t.il(), t.kg());
        sms.gonder(t.musteri(), no + " gönderiniz alındı");
        System.out.println("[Kasa] fiş: " + no);
    }
}
