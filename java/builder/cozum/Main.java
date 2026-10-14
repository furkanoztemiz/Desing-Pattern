// Bu dosya tools/export-java.js ile js/patterns/builder/data.js içinden üretildi.
package builder.cozum;

public class Main {

    public static void main(String[] args) {
        Gonderi kayisi = new Gonderi.Builder()
                .nereden("Malatya").nereye("Ankara").agirlik(20)
                .build();
        Gonderi asi = new Gonderi.Builder()
                .nereden("İstanbul").nereye("Van").agirlik(4)
                .sogukZincir().ekspres().sigorta(20000)
                .build();
        Gonderi vazo = new Gonderi.Builder()
                .nereden("Kütahya").nereye("İzmir").agirlik(12)
                .kirilgan().sigorta(5000)      // artık her değerin bir adı var
                .build();

        System.out.println(kayisi);
        System.out.println(asi);
        System.out.println(vazo);
    }
}
