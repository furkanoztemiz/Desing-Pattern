// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.observer;

public class Main {

    public static void main(String[] args) {
        AliciTelefonu aliTel = new AliciTelefonu("Ali");
        AliciTelefonu zeynepTel = new AliciTelefonu("Zeynep");
        SaticiPaneli panel = new SaticiPaneli();
        KuryeTableti tablet = new KuryeTableti();
        Gonderi g1001 = new Gonderi("KRG-1001");
        g1001.aboneEkle(aliTel);
        g1001.aboneEkle(panel);
        g1001.aboneEkle(tablet);
        Gonderi g1003 = new Gonderi("KRG-1003");
        g1003.aboneEkle(zeynepTel);
        g1003.aboneEkle(panel);
        g1003.aboneEkle(tablet);

        g1001.setDurum("Yolda");
        g1003.setDurum("Yolda");
        g1001.aboneCikar(aliTel);
        g1001.setDurum("Dağıtımda");
        g1001.teslimEt("Ali Şahin");
        System.out.println(panel.ekran());
        System.out.println(tablet.rota());
    }
}
