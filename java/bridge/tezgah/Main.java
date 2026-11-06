// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.tezgah;

public class Main {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi("KRG-1002", "Ayşe Yılmaz");
        Gonderi iade = new Gonderi("KRG-1003", "Zeynep Güneş");

        new KirilacakEtiket(new TermalYazici()).yazdir(vazo);   // aynı etiket, başka yazıcı
        new IadeEtiketi(new TermalYazici()).yazdir(iade);       // aynı yazıcı, başka etiket

        Etiket etiket = new KirilacakEtiket(new ZebraYazici());
        etiket.yaziciDegistir(new PdfYazici());                 // çalışma anında: Zebra'da kâğıt bitti
        etiket.yazdir(vazo);
    }
}
