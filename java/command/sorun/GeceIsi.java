// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.sorun;

import java.util.ArrayList;
import java.util.List;

/**
 * Gece işi: işlemleri metin olarak biriktirir, gece 02:00’de sırayla yapar.
 */
public class GeceIsi {

    private final Depo depo;
    private final Kamyon kamyon;
    private final List<String> plan = new ArrayList<>();

    public GeceIsi(Depo depo, Kamyon kamyon) {
        this.depo = depo;
        this.kamyon = kamyon;
    }

    public void ekle(String satir) {
        plan.add(satir);
    }

    public void calistir() {
        System.out.println("[Gece] 02:00, " + plan.size() + " iş");
        for (String satir : plan) {
            System.out.println("[Gece] " + satir);
            String[] p = satir.split(" ");
            switch (p[0]) {                                 // paneldeki switch’in kopyası
                case "TASI" -> depo.tasi(p[1], p[2]);
                case "YUKLE" -> {
                    depo.cikar(p[1]);
                    kamyon.yukle(p[1]);
                }
                default -> throw new IllegalArgumentException("bilinmeyen işlem: " + p[0]);
            }
        }
    }
}
