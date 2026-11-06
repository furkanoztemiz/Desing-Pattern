// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.cozum;

import java.util.List;

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

        Parca bisiklet = new Urun("Bisiklet", 12000);       // kolisiz gönderilir

        List<Parca> sevkiyat = List.of(siparis, bisiklet);
        int toplam = 0;
        for (Parca p : sevkiyat) {
            p.listele("");                                  // ürün mü koli mi, sormadan
            toplam += p.agirlik();
        }
        System.out.println("Sevkiyat: " + toplam + " g");
    }
}
