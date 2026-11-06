// Bu dosya tools/export-java.js ile js/patterns/composite/data.js içinden üretildi.
package composite.akis.agirlik;

/**
 * «Component» — Ağaçtaki her şey bir parça: tek bir ürün de, içinde başka parçalar olan bir koli de.
 */
public interface Parca {

    int agirlik();                      // gram

    void listele(String girinti);
}
