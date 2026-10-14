// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.bicim.finalnesne;

/**
 * «Target» — Sistemimizin her kargo firmasından beklediği arayüz.
 */
public interface KargoFirmasi {

    String gonderiOlustur(String nereden, String nereye, int kg);   // → takip numarası

    String durumSorgula(String takipNo);                            // → "Yolda" gibi bir metin
}
