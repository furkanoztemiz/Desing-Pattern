// Bu dosya tools/export-java.js ile js/patterns/command/data.js içinden üretildi.
package command.tezgah.komutlu;

/**
 * «Command» — Bir isteği nesne olarak paketler: çalıştırılabilir, geri alınabilir, sıraya konabilir.
 */
public interface Komut {

    void calistir();

    void geriAl();

    String ad();
}
