// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.akis.iki;

public class Main {

    public static void main(String[] args) {
        AliciTelefonu aliTel = new AliciTelefonu("Ali");
        AliciTelefonu zeynepTel = new AliciTelefonu("Zeynep");
        SaticiPaneli panel = new SaticiPaneli();
        Gonderi g1001 = new Gonderi("KRG-1001");
        g1001.aboneEkle(aliTel);
        g1001.aboneEkle(panel);
        Gonderi g1003 = new Gonderi("KRG-1003");
        g1003.aboneEkle(zeynepTel);
        g1003.aboneEkle(panel);

        g1001.setDurum("Yolda");
        g1003.setDurum("Yolda");
        g1001.aboneCikar(aliTel);
        g1001.setDurum("Dağıtımda");
        System.out.println(panel.ekran());
    }
}
