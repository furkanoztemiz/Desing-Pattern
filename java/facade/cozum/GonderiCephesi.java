// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.cozum;

import java.util.Optional;

/**
 * «Facade» — Gönderi oluşturmanın tek kapısı: alt sistemleri doğru sırayla ve kurallarıyla çalıştırır.
 */
public class GonderiCephesi {

    private final AdresServisi adres;
    private final TarifeServisi tarife;
    private final OdemeServisi odeme;
    private final TakipNoServisi takip;
    private final EtiketServisi etiket;
    private final KuryeServisi kurye;
    private final BildirimServisi sms;

    public GonderiCephesi(AdresServisi adres, TarifeServisi tarife, OdemeServisi odeme,
            TakipNoServisi takip, EtiketServisi etiket, KuryeServisi kurye, BildirimServisi sms) {
        this.adres = adres;
        this.tarife = tarife;
        this.odeme = odeme;
        this.takip = takip;
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
        etiket.bas(no, tamAdres);
        kurye.ata(no, t.il());
        sms.gonder(t.musteri(), no + " gönderiniz alındı");
        return Optional.of(no);
    }
}
