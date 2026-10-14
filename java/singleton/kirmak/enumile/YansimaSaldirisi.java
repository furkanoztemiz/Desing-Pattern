// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.kirmak.enumile;

import java.lang.reflect.Constructor;

public class YansimaSaldirisi {

    public static void main(String[] args) throws Exception {
        TakipNoUretici asil = TakipNoUretici.INSTANCE;

        Constructor<TakipNoUretici> kurucu = TakipNoUretici.class.getDeclaredConstructor(String.class, int.class);
        kurucu.setAccessible(true);   // private kilidi açılıyor!
        try {
            TakipNoUretici sahte = kurucu.newInstance("SAHTE", 1);
            System.out.println("Aynı nesne mi? " + (asil == sahte));
        } catch (IllegalArgumentException e) {
            System.out.println("Saldırı engellendi: " + e.getMessage());
        }
    }
}
