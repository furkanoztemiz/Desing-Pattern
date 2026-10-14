// Bu dosya tools/export-java.js ile js/patterns/factory-method/data.js içinden üretildi.
package factorymethod.cozum;

/**
 * «Creator» — Yaratıcı
 * Teslimat sürecini yönetir ama aracı kendisi üretmez.
 */
public abstract class Lojistik {

    // İş mantığı: yalnızca TasimaAraci arayüzünü tanır.
    public void teslimatPlanla(String yuk) {
        System.out.println("[Plan] " + yuk + " için araç hazırlanıyor...");
        TasimaAraci arac = aracOlustur();   // new yok!
        arac.teslimEt(yuk);
    }

    // FABRİKA METODU: Hangi aracın üretileceğine alt sınıflar karar verir.
    protected abstract TasimaAraci aracOlustur();
}
