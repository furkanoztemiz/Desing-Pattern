// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.kirmak.acik;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

public class YansimaSaldirisi {

    public static void main(String[] args) throws Exception {
        TakipNoUretici asil = TakipNoUretici.getInstance();

        Constructor<TakipNoUretici> kurucu = TakipNoUretici.class.getDeclaredConstructor();
        kurucu.setAccessible(true);   // private kilidi açılıyor!
        try {
            TakipNoUretici sahte = kurucu.newInstance();
            System.out.println("Aynı nesne mi? " + (asil == sahte));
        } catch (InvocationTargetException e) {
            System.out.println("Saldırı engellendi: " + e.getCause().getMessage());
        }
    }
}
