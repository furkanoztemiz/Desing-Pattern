// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.kirmak.korumali;

import java.io.*;

public class SerilestirmeSaldirisi {

    public static void main(String[] args) throws Exception {
        TakipNoUretici asil = TakipNoUretici.getInstance();

        ByteArrayOutputStream bayt = new ByteArrayOutputStream();
        try (ObjectOutputStream yaz = new ObjectOutputStream(bayt)) {
            yaz.writeObject(asil);   // nesneyi bayt dizisine çevir
        }
        try (ObjectInputStream oku = new ObjectInputStream(new ByteArrayInputStream(bayt.toByteArray()))) {
            TakipNoUretici kopya = (TakipNoUretici) oku.readObject();   // baytlardan geri oku
            System.out.println("Aynı nesne mi? " + (asil == kopya));
        }
    }
}
