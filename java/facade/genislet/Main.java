// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.genislet;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        AdresServisi adres = new AdresServisi();
        TarifeServisi tarife = new TarifeServisi();
        OdemeServisi odeme = new OdemeServisi();
        TakipNoServisi takip = new TakipNoServisi();
        EtiketServisi etiket = new EtiketServisi();
        KuryeServisi kurye = new KuryeServisi();
        BildirimServisi sms = new BildirimServisi();

        GonderiCephesi cephe = new GonderiCephesi(adres, tarife, odeme, takip, etiket, kurye, sms);
        SubeKasasi kasa = new SubeKasasi(cephe);
        WebSitesi web = new WebSitesi(cephe);
        KurumsalApi api = new KurumsalApi(cephe);

        kasa.gonder(new Talep("Ali Şahin", "Battalgazi", "Malatya", 3));
        web.gonder(new Talep("Ayşe Yılmaz", "Çankaya", "Ankara", 2));
        web.gonder(new Talep("Can Demir", "Kadıköy", "İstanbul", 1));
        api.topluGonder(List.of(
                new Talep("Ayşe Yılmaz", "Çankaya", "Ankara", 5),
                new Talep("Can Demir", "Kadıköy", "İstanbul", 2)));
        System.out.println("Gün sonu: " + EtiketServisi.basilan + " etiket, " + OdemeServisi.tahsilat + " TL tahsilat");
    }
}
