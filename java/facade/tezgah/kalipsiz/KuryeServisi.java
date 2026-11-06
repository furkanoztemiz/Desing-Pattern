// Bu dosya tools/export-java.js ile js/patterns/facade/data.js içinden üretildi.
package facade.tezgah.kalipsiz;

import java.util.Map;

/**
 * «Subsystem» — Kurye planlama (yeni sürüm: araç kiloya göre seçilir).
 */
public class KuryeServisi {

    private static final Map<String, String> KURYE = Map.of("Malatya", "Mehmet", "Ankara", "Elif", "İstanbul", "Burak", "İzmir", "Deniz");

    public String planla(String no, String il, int kg) {    // yeni imza
        String kurye = KURYE.get(il);
        String arac = kg <= 2 ? "motosiklet" : "kamyonet";
        System.out.println("[Kurye] " + no + " → " + kurye + " (" + il + ", " + arac + ")");
        return kurye;
    }
}
