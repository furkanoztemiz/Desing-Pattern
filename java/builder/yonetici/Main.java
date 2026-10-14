// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

public class Main {

    public static void main(String[] args) {
        GonderiYoneticisi yonetici = new GonderiYoneticisi();

        Gonderi.Builder paket = new Gonderi.Builder();
        yonetici.asiGonderisi(paket);
        System.out.println(paket.build());

        EtiketHazirlayici etiket = new EtiketHazirlayici();
        yonetici.asiGonderisi(etiket);
        System.out.println(etiket.build());

        FiyatHazirlayici fiyat = new FiyatHazirlayici();
        yonetici.asiGonderisi(fiyat);
        System.out.println("Fiyat: " + fiyat.build() + " TL");

        JsonHazirlayici json = new JsonHazirlayici();
        yonetici.asiGonderisi(json);
        System.out.println(json.build());
    }
}
