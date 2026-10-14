// Bu dosya tools/export-java.js ile js/patterns/prototype/data.js içinden üretildi.
package prototype.cozum;

/**
 * «Client» — "Geçen haftakini tekrarla" düğmesi: son gönderinin aynısını yeniden oluşturur.
 */
public class SiparisEkrani {

    public static Gonderi tekrarla(Gonderi son) {
        return son.kopyala();                   // türünü sormadan: kendini kopyalasın
    }
}
