// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.sorun.teleskop;

public class Gonderi {

    private final String nereden;
    private final String nereye;
    private final int agirlik;
    private final boolean kirilgan;
    private final boolean sogukZincir;
    private final boolean ekspres;
    private final int sigorta;

    public Gonderi(String nereden, String nereye, int agirlik) {
        this(nereden, nereye, agirlik, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan) {
        this(nereden, nereye, agirlik, kirilgan, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir) {
        this(nereden, nereye, agirlik, kirilgan, sogukZincir, false);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir, boolean ekspres) {
        this(nereden, nereye, agirlik, kirilgan, sogukZincir, ekspres, 0);
    }

    public Gonderi(String nereden, String nereye, int agirlik, boolean kirilgan,
                   boolean sogukZincir, boolean ekspres, int sigorta) {
        this.nereden = nereden;
        this.nereye = nereye;
        this.agirlik = agirlik;
        this.kirilgan = kirilgan;
        this.sogukZincir = sogukZincir;
        this.ekspres = ekspres;
        this.sigorta = sigorta;
    }

    @Override
    public String toString() {
        StringBuilder s = new StringBuilder(nereden + " > " + nereye + ", " + agirlik + " kg");
        if (kirilgan) s.append(", KIRILGAN");
        if (sogukZincir) s.append(", SOĞUK ZİNCİR");
        if (ekspres) s.append(", EKSPRES");
        if (sigorta > 0) s.append(", sigorta ").append(sigorta).append(" TL");
        return "Gönderi[" + s + "]";
    }
}
