// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.sorun.javabeans;

public class Gonderi {

    private String nereden;
    private String nereye;
    private int agirlik = 1;
    private boolean kirilgan;
    private boolean sogukZincir;
    private boolean ekspres;
    private int sigorta;

    public void setNereden(String nereden) { this.nereden = nereden; }
    public void setNereye(String nereye) { this.nereye = nereye; }
    public void setAgirlik(int agirlik) { this.agirlik = agirlik; }
    public void setKirilgan(boolean kirilgan) { this.kirilgan = kirilgan; }
    public void setSogukZincir(boolean sogukZincir) { this.sogukZincir = sogukZincir; }
    public void setEkspres(boolean ekspres) { this.ekspres = ekspres; }
    public void setSigorta(int sigorta) { this.sigorta = sigorta; }

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
