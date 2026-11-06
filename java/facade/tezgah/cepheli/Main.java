// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.cepheli;

public class Main {

    public static void main(String[] args) {
        AdresServisi adres = new AdresServisi();
        TarifeServisi tarife = new TarifeServisi();
        OdemeServisi odeme = new OdemeServisi();
        TakipNoServisi takip = new TakipNoServisi();
        SigortaServisi sigorta = new SigortaServisi();
        EtiketServisi etiket = new EtiketServisi();
        KuryeServisi kurye = new KuryeServisi();
        BildirimServisi sms = new BildirimServisi();

        GonderiCephesi cephe = new GonderiCephesi(adres, tarife, odeme, takip, sigorta, etiket, kurye, sms);
        SubeKasasi kasa = new SubeKasasi(cephe);
        WebSitesi web = new WebSitesi(cephe);
        MobilUygulama mobil = new MobilUygulama(cephe);

        kasa.gonder(new Talep("Ali Şahin", "Battalgazi", "Malatya", 3));
        web.gonder(new Talep("Ayşe Yılmaz", "Çankaya", "Ankara", 2));
        web.gonder(new Talep("Can Demir", "Kadıköy", "İstanbul", 1));
        mobil.gonder(new Talep("Zeynep Güneş", "Konak", "İzmir", 1));
        System.out.println("Gün sonu: " + EtiketServisi.basilan + " etiket, " + OdemeServisi.tahsilat + " TL tahsilat");
    }
}
