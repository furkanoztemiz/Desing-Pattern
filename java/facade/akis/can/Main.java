// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.can;

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
        WebSitesi web = new WebSitesi(cephe);

        web.gonder(new Talep("Can Demir", "Kadıköy", "İstanbul", 1));
        System.out.println("Gün sonu: " + EtiketServisi.basilan + " etiket, " + OdemeServisi.tahsilat + " TL tahsilat");
    }
}
