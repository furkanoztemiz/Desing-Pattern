// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.genislet;

public class Main {

    public static void main(String[] args) {
        AliciTelefonu telefon = new AliciTelefonu("Ali");
        SaticiPaneli panel = new SaticiPaneli();
        KuryeTableti tablet = new KuryeTableti();
        CagriMerkezi merkez = new CagriMerkezi();
        Gonderi gonderi = new Gonderi("KRG-1001");
        gonderi.aboneEkle(telefon);
        gonderi.aboneEkle(panel);
        gonderi.aboneEkle(tablet);
        gonderi.aboneEkle(merkez);

        gonderi.setDurum("Yolda");
        gonderi.setDurum("Dağıtımda");
        gonderi.teslimEt("Ali Şahin");
        System.out.println(tablet.rota());
        System.out.println(merkez.sorgula("KRG-1001"));
    }
}
