// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

/**
 * «ConcreteBuilder» — aynı adımlardan yazdırılabilir bir kargo ETİKETİ üretir.
 */
public class EtiketHazirlayici implements GonderiHazirlayici {

    private final StringBuilder etiket = new StringBuilder("KARGO ETİKETİ\n");

    @Override
    public EtiketHazirlayici nereden(String sehir) {
        etiket.append("Gönderen : ").append(sehir).append('\n');
        return this;
    }

    @Override
    public EtiketHazirlayici nereye(String sehir) {
        etiket.append("Alıcı    : ").append(sehir).append('\n');
        return this;
    }

    @Override
    public EtiketHazirlayici agirlik(int kg) {
        etiket.append("Ağırlık  : ").append(kg).append(" kg\n");
        return this;
    }

    @Override
    public EtiketHazirlayici kirilgan() {
        etiket.append("!! KIRILACAK EŞYA !!\n");
        return this;
    }

    @Override
    public EtiketHazirlayici sogukZincir() {
        etiket.append("** SOĞUK ZİNCİR: 2-8 C **\n");
        return this;
    }

    @Override
    public EtiketHazirlayici ekspres() {
        etiket.append(">> EKSPRES >>\n");
        return this;
    }

    @Override
    public EtiketHazirlayici sigorta(int tutar) {
        etiket.append("Sigorta  : ").append(tutar).append(" TL\n");
        return this;
    }

    public String build() {               // «getResult»: ürün bir metin
        return etiket.toString().trim();
    }
}
