// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.seffaf;

public class Main {

    public static void main(String[] args) {
        Parca siparis = new Koli("Sipariş KRG-2001", 300);
        Parca aksesuar = new Koli("Aksesuar kutusu", 100);
        Parca saatKutusu = new Koli("Saat kutusu", 100);
        Parca hediye = new Koli("Hediye kutusu", 150);
        Parca poset = new Koli("Balonlu poşet", 50);
        Parca laptop = new Urun("Laptop", 2000);

        siparis.ekle(laptop);
        siparis.ekle(aksesuar);
        siparis.ekle(new Urun("Kılıf", 200));
        siparis.ekle(hediye);

        aksesuar.ekle(new Urun("Mouse", 100));
        aksesuar.ekle(new Urun("Şarj aleti", 400));
        aksesuar.ekle(saatKutusu);

        saatKutusu.ekle(new Urun("Saat", 200));

        hediye.ekle(new Urun("Kupa", 300));
        hediye.ekle(poset);

        poset.ekle(new Urun("Parfüm", 400));

        laptop.ekle(new Urun("Kitap", 500));    // ürünün içine?

        siparis.listele("");
        System.out.println("Toplam: " + siparis.agirlik() + " g");
    }
}
