// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.yonetici;

import java.util.ArrayList;
import java.util.List;

/**
 * «ConcreteBuilder» — aynı adımlardan web servisi için JSON üretir.
 */
public class JsonHazirlayici implements GonderiHazirlayici {

    private final List<String> alanlar = new ArrayList<>();

    @Override
    public JsonHazirlayici nereden(String sehir) {
        alanlar.add("\"nereden\": \"" + sehir + "\"");
        return this;
    }

    @Override
    public JsonHazirlayici nereye(String sehir) {
        alanlar.add("\"nereye\": \"" + sehir + "\"");
        return this;
    }

    @Override
    public JsonHazirlayici agirlik(int kg) {
        alanlar.add("\"agirlik\": " + kg);
        return this;
    }

    @Override
    public JsonHazirlayici kirilgan() {
        alanlar.add("\"kirilgan\": true");
        return this;
    }

    @Override
    public JsonHazirlayici sogukZincir() {
        alanlar.add("\"sogukZincir\": true");
        return this;
    }

    @Override
    public JsonHazirlayici ekspres() {
        alanlar.add("\"ekspres\": true");
        return this;
    }

    @Override
    public JsonHazirlayici sigorta(int tutar) {
        alanlar.add("\"sigorta\": " + tutar);
        return this;
    }

    public String build() {               // «getResult»: ürün bir JSON metni
        return "{" + String.join(", ", alanlar) + "}";
    }
}
