// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.genislet;

/**
 * «Implementor» — Yazıcının ilkel işlemleri. Her cihaz bunları kendi komut diliyle gerçekler.
 */
public interface Yazici {

    void basla();

    void yazi(int x, int y, String metin);      // konumlar milimetre

    void barkod(int x, int y, String veri);

    void cerceve(int x, int y, int en, int boy);

    void bitir();
}
