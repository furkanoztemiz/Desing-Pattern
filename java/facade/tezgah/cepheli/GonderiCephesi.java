// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.cepheli;

import java.util.Optional;

/**
 * «Facade» — Gönderi oluşturmanın tek kapısı: alt sistemleri doğru sırayla ve kurallarıyla çalıştırır.
 */
public class GonderiCephesi {

    private final AdresServisi adres;
    private final TarifeServisi tarife;
    private final OdemeServisi odeme;
    private final TakipNoServisi takip;
    private final SigortaServisi sigorta;
    private final EtiketServisi etiket;
    private final KuryeServisi kurye;
    private final BildirimServisi sms;

    public GonderiCephesi(AdresServisi adres, TarifeServisi tarife, OdemeServisi odeme,
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

    public Optional<String> gonder(Talep t) {       // üst düzey, sade işlem
        String tamAdres = adres.dogrula(t.adres(), t.il());
        int tutar = tarife.hesapla(t.kg());
        if (!odeme.cek(t.musteri(), tutar)) {               // kart limiti: reddedilirse DUR
            sms.gonder(t.musteri(), "ödeme alınamadı, gönderi oluşturulmadı");
            return Optional.empty();
        }
        String no = takip.yeni();
        sigorta.police(no, tutar);
        etiket.bas(no, tamAdres);
        kurye.planla(no, t.il(), t.kg());
        sms.gonder(t.musteri(), no + " gönderiniz alındı");
        return Optional.of(no);
    }
}
