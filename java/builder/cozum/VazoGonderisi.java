// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.cozum;

public class VazoGonderisi {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi.Builder()
                .nereden("Kütahya")
                .nereye("İzmir")
                .agirlik(12)
                .kirilgan()
                .sigorta(5000)
                .build();

        System.out.println(vazo);
    }
}
