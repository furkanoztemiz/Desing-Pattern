// Bu dosya tools/export-java.js ile js/patterns/abstract-factory/data.js içinden üretildi.
package abstractfactory.cozum;

/** Yalnızca testlerde kullanılan sahte (mock) aile. */
public class TestFabrikasi implements LojistikFabrikasi {

    @Override
    public TasimaAraci aracOlustur() {
        return new TasimaAraci() {
            public String gerekenBelge() { return "TEST"; }
            public void teslimEt(String yuk) { System.out.println("[Test] " + yuk + " teslim edildi (sahte)."); }
        };
    }

    @Override
    public TasimaBelgesi belgeOlustur() {
        return new TasimaBelgesi() {
            public String ad() { return "TEST"; }
            public void hazirla(String yuk) { System.out.println("[Test] belge hazır (sahte)."); }
        };
    }

    public static void main(String[] args) {
        new TeslimatServisi(new TestFabrikasi()).gonder("deneme kolisi");
    }
}
