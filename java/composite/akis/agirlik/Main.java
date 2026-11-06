// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.akis.agirlik;

public class Main {

    public static void main(String[] args) {
        Koli siparis = new Koli("Sipariş KRG-2001", 300);
        Koli aksesuar = new Koli("Aksesuar kutusu", 100);
        Koli saatKutusu = new Koli("Saat kutusu", 100);

        siparis.ekle(new Urun("Laptop", 2000));
        siparis.ekle(aksesuar);
        siparis.ekle(new Urun("Kılıf", 200));

        aksesuar.ekle(new Urun("Mouse", 100));
        aksesuar.ekle(new Urun("Şarj aleti", 400));
        aksesuar.ekle(saatKutusu);

        saatKutusu.ekle(new Urun("Saat", 200));

        System.out.println("Toplam: " + siparis.agirlik() + " g");
    }
}
