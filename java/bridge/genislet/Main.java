// Bu dosya tools/export-java.js ile js/patterns/bridge/data.js içinden üretildi.
package bridge.genislet;

public class Main {

    public static void main(String[] args) {
        Gonderi vazo = new Gonderi("KRG-1002", "Ayşe Yılmaz");
        Gonderi iade = new Gonderi("KRG-1003", "Zeynep Güneş");

        Yazici html = new HtmlYazici();                 // YENİ gerçekleştirici

        new KirilacakEtiket(html).yazdir(vazo);
        new IadeEtiketi(html).yazdir(iade);             // etiket sınıflarına dokunmadan
    }
}
