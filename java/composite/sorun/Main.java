// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.sorun;

public class Main {

    public static void main(String[] args) {
        Koli siparis = new Koli("Sipariş KRG-2001", 300);
        siparis.ekle(new Urun("Laptop", 2000));

        Koli aksesuar = new Koli("Aksesuar kutusu", 100);
        aksesuar.ekle(new Urun("Mouse", 100));
        aksesuar.ekle(new Urun("Şarj aleti", 400));

        Koli saatKutusu = new Koli("Saat kutusu", 100);
        saatKutusu.ekle(new Urun("Saat", 200));
        aksesuar.ekle(saatKutusu);                          // kutu içinde kutu içinde koli

        siparis.ekle(aksesuar);                             // koli içinde koli
        siparis.ekle(new Urun("Kılıf", 200));

        Urun bisiklet = new Urun("Bisiklet", 12000);        // kolisiz gönderilir

        Kantar.listele(siparis);
        Kantar.listele(bisiklet);
        System.out.println("Sevkiyat: " + (Kantar.agirlik(siparis) + Kantar.agirlik(bisiklet)) + " g");
    }
}
