// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.sorun.teleskop;

public class Main {

    public static void main(String[] args) {
        Gonderi kayisi = new Gonderi("Malatya", "Ankara", 20);
        Gonderi asi = new Gonderi("İstanbul", "Van", 4, false, true, true, 20000);
        // cam vazo: kırılgan + sigortalı olmalı
        Gonderi vazo = new Gonderi("Kütahya", "İzmir", 12, false, true, false, 5000);

        System.out.println(kayisi);
        System.out.println(asi);
        System.out.println(vazo);
    }
}
