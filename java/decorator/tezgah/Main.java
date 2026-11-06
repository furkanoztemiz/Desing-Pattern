// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.tezgah;

public class Main {

    public static void main(String[] args) {
        KargoHizmeti disarida = new KurumsalIndirim(new Sigorta(new Ekspres(new StandartKargo())));     // indirim en dışta
        KargoHizmeti iceride = new Sigorta(new Ekspres(new KurumsalIndirim(new StandartKargo())));      // indirim en içte
        KargoHizmeti ikiSms = new SmsBildirim(new SmsBildirim(new Sigorta(new StandartKargo())));       // aynı katman iki kez

        for (KargoHizmeti h : new KargoHizmeti[] { disarida, iceride, ikiSms }) {
            System.out.println(h.aciklama() + " = " + h.ucret() + " TL");
        }
    }
}
