// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.cozum;

/**
 * Kapıya gelen gönderi.
 */
public record Gonderi(String takipNo, String alici, int kg, boolean sogukZincir, Kapi kapi) {

    public static Gonderi koli(String takipNo, String alici, int kg, Kapi kapi) {
        return new Gonderi(takipNo, alici, kg, false, kapi);
    }

    public static Gonderi ilac(String takipNo, String alici, int kg, Kapi kapi) {
        return new Gonderi(takipNo, alici, kg, true, kapi);
    }

    public String etiket() {
        return takipNo + " " + alici + " · " + kg + " kg" + (sogukZincir ? " · soğuk zincir" : "") + " · " + kapi;
    }
}
