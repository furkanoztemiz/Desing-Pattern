// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.genislet;

/**
 * Haritada bir nokta (km). Sokaklar ızgara gibi: iki nokta arası |dx| + |dy| km.
 */
public record Konum(int x, int y) {

    public static final Konum DEPO = new Konum(1, 1);

    public int mesafe(Konum o) {
        return Math.abs(x - o.x) + Math.abs(y - o.y);
    }
}
