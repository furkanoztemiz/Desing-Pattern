// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.sorun;

public class Main {

    public static void main(String[] args) {
        AliciTelefonu telefon = new AliciTelefonu("Ali");
        SaticiPaneli panel = new SaticiPaneli();
        KuryeTableti tablet = new KuryeTableti();
        Gonderi gonderi = new Gonderi("KRG-1001", telefon, panel, tablet);

        gonderi.setDurum("Yolda");
        gonderi.setDurum("Dağıtımda");
        gonderi.teslimEt("Ali Şahin");
        System.out.println(panel.ekran());
        System.out.println(tablet.rota());
    }
}
