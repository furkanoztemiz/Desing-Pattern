// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.cozum;

/**
 * «Product» — Gönderi. DEĞİŞMEZ (immutable): alanlar final, set metodu yok.
 * Yalnızca iç sınıf Gonderi.Builder oluşturabilir.
 */
public class Gonderi {

    private final String nereden;
    private final String nereye;
    private final int agirlik;
    private final boolean kirilgan;
    private final boolean sogukZincir;
    private final boolean ekspres;
    private final int sigorta;

    private Gonderi(Builder b) {          // yalnızca Builder çağırabilir
        this.nereden = b.nereden;
        this.nereye = b.nereye;
        this.agirlik = b.agirlik;
        this.kirilgan = b.kirilgan;
        this.sogukZincir = b.sogukZincir;
        this.ekspres = b.ekspres;
        this.sigorta = b.sigorta;
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

    /**
     * «Builder» — Gönderiyi adım adım toplar; build() doğrular ve değişmez nesneyi verir.
     */
    public static class Builder {

        private String nereden;
        private String nereye;
        private int agirlik = 1;          // varsayılan değerler
        private boolean kirilgan;
        private boolean sogukZincir;
        private boolean ekspres;
        private int sigorta;

        public Builder nereden(String sehir) {
            this.nereden = sehir;
            return this;                  // zincirleme için kendini döndür
        }

        public Builder nereye(String sehir) {
            this.nereye = sehir;
            return this;
        }

        public Builder agirlik(int kg) {
            this.agirlik = kg;
            return this;
        }

        public Builder kirilgan() {
            this.kirilgan = true;
            return this;
        }

        public Builder sogukZincir() {
            this.sogukZincir = true;
            return this;
        }

        public Builder ekspres() {
            this.ekspres = true;
            return this;
        }

        public Builder sigorta(int tutar) {
            this.sigorta = tutar;
            return this;
        }

        public Gonderi build() {
            if (nereden == null || nereye == null) {
                throw new IllegalStateException("Gönderi: nereden ve nereye zorunlu!");
            }
            if (kirilgan && sigorta == 0) {
                throw new IllegalStateException("Gönderi: kırılgan eşya sigortasız gönderilemez!");
            }
            return new Gonderi(this);     // nesne YALNIZCA burada doğar
        }
    }
}
