// Bu dosya tools/export-java.js ile js/patterns/decorator/data.js içinden üretildi.
package decorator.cozum;

/**
 * «Decorator» — Bütün ek hizmetlerin ortak atası: içteki hizmeti SARAR.
 * İçteki, bir çekirdek de olabilir başka bir ek hizmet de: katmanlar iç içe geçer.
 */
public abstract class EkHizmet implements KargoHizmeti {

    protected final KargoHizmeti icteki;            // sarılan hizmet

    protected EkHizmet(KargoHizmeti icteki) {
        this.icteki = icteki;
    }
}
