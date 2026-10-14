// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.cozum;

public class HataliGonderi {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi.Builder()
                .nereden("Kütahya")
                .nereye("İzmir")
                .agirlik(12)
                .kirilgan()            // sigorta(...) unutuldu!
                .build();

        System.out.println(vazo);
    }
}
