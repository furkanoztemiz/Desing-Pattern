// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.sorun;

/**
 * Kargo dolabı: üç hatalı kodda kilitlenir. Durum hâlâ bir dizgi; her metot durumları if/else ile sorar.
 */
public class KargoDolabi {

    private String durum = "BOŞ";
    private String paket;
    private String kod;
    private int hatali;

    public void paketKoy(String koli, String kod) {
        System.out.println("[" + durum + "] paketKoy(" + koli + ")");
        if (durum.equals("DOLU")) {
            System.out.println("  dolu: " + koli + " konamadı");
        } else {                                    // BOŞ ise
            paket = koli;
            this.kod = kod;
            System.out.println("  " + koli + " kondu · kod SMS ile gönderildi");
            durumDegistir("DOLU");
        }
    }

    public void kodGir(String girilen) {
        System.out.println("[" + durum + "] kodGir(" + girilen + ")");
        if (durum.equals("BOŞ")) {
            System.out.println("  dolap boş");
        } else if (durum.equals("KİLİTLİ")) {
            System.out.println("  kilitli: görevli bekleniyor");
        } else if (girilen.equals(kod)) {
            System.out.println("  kapak açıldı: " + paket + " teslim edildi");
            paket = null;
            kod = null;
            hatali = 0;
            durumDegistir("BOŞ");
        } else {
            hatali++;
            System.out.println("  hatalı kod (" + hatali + "/3)");
            if (hatali == 3) {
                durumDegistir("KİLİTLİ");
            }
        }
    }

    public void gorevliAc() {
        System.out.println("[" + durum + "] gorevliAc()");
        if (durum.equals("KİLİTLİ")) {
            hatali = 0;
            System.out.println("  görevli kilidi açtı");
            durumDegistir("DOLU");
        } else if (durum.equals("DOLU")) {
            System.out.println("  dolap kilitli değil");
        } else {
            System.out.println("  dolap boş · yapılacak iş yok");
        }
    }

    public String ozet() {
        return "Dolap: " + durum + " · paket: " + (paket == null ? "yok" : paket);
    }

    private void durumDegistir(String yeni) {
        System.out.println("  durum: " + durum + " → " + yeni);
        durum = yeni;
    }
}
