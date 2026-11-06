// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.tezgah.durumlu;

/**
 * «Context» — Kargo dolabı: istemcinin tanıdığı sınıf; her isteği o anki durum nesnesine devreder.
 */
public class KargoDolabi {

    private DolapDurumu durum = new BosDurum();
    private String paket;
    private String kod;
    private int hatali;

    public void paketKoy(String koli, String kod) {
        System.out.println("[" + durum.ad() + "] paketKoy(" + koli + ")");
        durum.paketKoy(this, koli, kod);
    }

    public void kodGir(String girilen) {
        System.out.println("[" + durum.ad() + "] kodGir(" + girilen + ")");
        durum.kodGir(this, girilen);
    }

    public void gorevliAc() {
        System.out.println("[" + durum.ad() + "] gorevliAc()");
        durum.gorevliAc(this);
    }

    public String ozet() {
        return "Dolap: " + durum.ad() + " · paket: " + (paket == null ? "yok" : paket);
    }

    // ---- durum nesnelerinin kullandığı işlemler (paket içi erişim)

    void durumDegistir(DolapDurumu yeni) {
        System.out.println("  durum: " + durum.ad() + " → " + yeni.ad());
        durum = yeni;
    }

    void paketiYerlestir(String koli, String kod) {
        paket = koli;
        this.kod = kod;
    }

    boolean kodDogruMu(String girilen) {
        return girilen.equals(kod);
    }

    String paketiVer() {
        String verilen = paket;
        paket = null;
        kod = null;
        hatali = 0;
        return verilen;
    }

    int hataliArtir() {
        return ++hatali;
    }

    void hatalariSifirla() {
        hatali = 0;
    }
}
