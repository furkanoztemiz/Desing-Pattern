// Bu dosya tools/export-java.js ile js/patterns/chain-of-responsibility/data.js içinden üretildi.
package chainofresponsibility.akis.ayse;

/**
 * «Client» — Kurye: kapıda ne olacağını bilmez; gönderiyi zincirin başına verir.
 */
public class Kurye {

    private final String bolge;
    private final TeslimatAdimi zincir;

    public Kurye(String bolge, TeslimatAdimi zincir) {
        this.bolge = bolge;
        this.zincir = zincir;
    }

    public void teslimEt(Gonderi g) {
        System.out.print("[" + bolge + "] " + g.etiket() + ": ");
        zincir.teslimEt(g);
    }
}
