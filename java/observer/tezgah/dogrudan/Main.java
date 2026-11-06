// Bu dosya tools/export-java.js ile js/patterns/observer/data.js içinden üretildi.
package observer.tezgah.dogrudan;

public class Main {

    public static void main(String[] args) {
        AliciTelefonu aliTel = new AliciTelefonu("Ali");
        AliciTelefonu zeynepTel = new AliciTelefonu("Zeynep");
        SaticiPaneli panel = new SaticiPaneli();
        KuryeTableti tablet = new KuryeTableti();
        Gonderi g1001 = new Gonderi("KRG-1001", aliTel, panel, tablet);
        Gonderi g1003 = new Gonderi("KRG-1003", zeynepTel, panel, tablet);

        g1001.setDurum("Yolda");
        g1003.setDurum("Yolda");
        // istek: aliTel artık g1001 bildirimi almasın (yolu yok)
        g1001.setDurum("Dağıtımda");
        g1001.teslimEt("Ali Şahin");
        System.out.println(panel.ekran());
        System.out.println(tablet.rota());
    }
}
