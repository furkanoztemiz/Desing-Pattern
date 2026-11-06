// Bu dosya tools/export-java.js ile js/patterns/state/data.js içinden üretildi.
package state.akis.teslim;

/**
 * «State» — Dolabın bir durumdaki davranışı: her istek için ne yapılacağını söyler.
 */
public interface DolapDurumu {

    void paketKoy(KargoDolabi dolap, String koli, String kod);

    void kodGir(KargoDolabi dolap, String girilen);

    void gorevliAc(KargoDolabi dolap);

    String ad();
}
