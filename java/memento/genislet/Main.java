// Bu dosya tools/export-java.js ile js/patterns/memento/data.js içinden üretildi.
package memento.genislet;

public class Main {

    public static void main(String[] args) {
        Depo depo = Depo.sabah();
        DepoGecmisi gecmis = new DepoGecmisi(depo);

        gecmis.islemOncesi();
        depo.tasi("KRG-1001", "B3");
        gecmis.islemOncesi();
        depo.yukle("KRG-1003");
        gecmis.geriAl();
        gecmis.geriAl();
        gecmis.yinele();
        System.out.println(depo.durum());
    }
}
