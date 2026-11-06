// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.tezgah.kalipsiz;

/**
 * Operatör paneli: isteği switch ile kendisi yapar; geri almak için yalnızca son işlemi hatırlar.
 */
public class OperatorPaneli {

    private final Depo depo;
    private final Kamyon kamyon;
    private String sonIslem;                                // geri al için: yalnızca SON işlem
    private String sonKoli;
    private String sonRaf;

    public OperatorPaneli(Depo depo, Kamyon kamyon) {
        this.depo = depo;
        this.kamyon = kamyon;
    }

    public void tikla(String islem, String koli, String raf) {
        System.out.println("[Panel] " + islem + " " + koli + (raf == null ? "" : " → " + raf));
        switch (islem) {
            case "TASI" -> {
                sonRaf = depo.yeri(koli);
                depo.tasi(koli, raf);
            }
            case "YUKLE" -> {
                sonRaf = depo.cikar(koli);
                kamyon.yukle(koli);
            }
            default -> throw new IllegalArgumentException("bilinmeyen işlem: " + islem);
        }
        sonIslem = islem;
        sonKoli = koli;
    }

    public void geriAl() {
        if (sonIslem == null) {
            System.out.println("[Panel] geri alınacak işlem yok");
            return;
        }
        System.out.println("[Panel] geri al: " + sonIslem + " " + sonKoli);
        switch (sonIslem) {
            case "TASI" -> depo.tasi(sonKoli, sonRaf);
            case "YUKLE" -> {
                kamyon.indir(sonKoli);
                depo.koy(sonKoli, sonRaf);
            }
            default -> throw new IllegalStateException(sonIslem);
        }
        sonIslem = null;
    }
}
