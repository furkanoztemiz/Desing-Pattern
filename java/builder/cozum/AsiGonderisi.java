// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.cozum;

public class AsiGonderisi {

    public static void main(String[] args) {
        Gonderi asi = new Gonderi.Builder()
                .nereden("İstanbul")
                .nereye("Van")
                .agirlik(4)
                .sogukZincir()
                .ekspres()
                .sigorta(20000)
                .build();

        System.out.println(asi);
    }
}
