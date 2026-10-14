// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.sorun.javabeans;

public class Main {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi();
        vazo.setNereden("Kütahya");
        vazo.setNereye("İzmir");
        vazo.setAgirlik(12);
        vazo.setKirilgan(true);
        // setSigorta(...) unutuldu: derleyici bir şey demez

        System.out.println(vazo);   // kırılgan ama sigortasız!
    }
}
