// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

/**
 * «ConcreteBuilder» — aynı adımlardan bir FİYAT hesaplar (ürün bir sayı).
 */
public class FiyatHazirlayici implements GonderiHazirlayici {

    private int toplam = 50;              // taban ücret (TL)
    private boolean ekspres;

    @Override
    public FiyatHazirlayici nereden(String sehir) {
        // fiyatı etkilemez
        return this;
    }

    @Override
    public FiyatHazirlayici nereye(String sehir) {
        // fiyatı etkilemez
        return this;
    }

    @Override
    public FiyatHazirlayici agirlik(int kg) {
        toplam += kg * 4;
        return this;
    }

    @Override
    public FiyatHazirlayici kirilgan() {
        toplam += 40;
        return this;
    }

    @Override
    public FiyatHazirlayici sogukZincir() {
        toplam += 120;
        return this;
    }

    @Override
    public FiyatHazirlayici ekspres() {
        ekspres = true;
        return this;
    }

    @Override
    public FiyatHazirlayici sigorta(int tutar) {
        toplam += tutar / 100;          // tutarın %1'i
        return this;
    }

    public int build() {                  // «getResult»: ürün bir sayı
        return ekspres ? toplam * 3 / 2 : toplam;
    }
}
