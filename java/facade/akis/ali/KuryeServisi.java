// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.akis.ali;

import java.util.Map;

/**
 * «Subsystem» — Kurye atama.
 */
public class KuryeServisi {

    private static final Map<String, String> KURYE = Map.of("Malatya", "Mehmet", "Ankara", "Elif", "İstanbul", "Burak", "İzmir", "Deniz");

    public String ata(String no, String il) {
        String kurye = KURYE.get(il);
        System.out.println("[Kurye] " + no + " → " + kurye + " (" + il + ")");
        return kurye;
    }
}
