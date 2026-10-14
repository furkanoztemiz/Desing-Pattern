// Bu dosya tools/export-java.js ile js/patterns/singleton/data.js içinden üretildi.
package singleton.yaris.korumasiz;

public class YarisDeneyi {

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(YarisDeneyi::numaraAl, "T1");
        Thread t2 = new Thread(YarisDeneyi::numaraAl, "T2");
        t1.start();
        t2.start();   // iki thread neredeyse aynı anda başlar
        t1.join();
        t2.join();
    }

    static void numaraAl() {
        String no = TakipNoUretici.getInstance().yeniNumara();
        System.out.println(Thread.currentThread().getName() + " aldı: " + no);
    }
}
