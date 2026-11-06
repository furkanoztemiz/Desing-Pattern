// Bu dosya tools/export-java.js ile js/patterns/strategy/data.js içinden üretildi.
package strategy.tuzak;

import java.util.List;

public class Main {

    public static void main(String[] args) {
        List<Durak> gun = Durak.gunun();
        RotaStratejisi planli = new PlanliRota();  // “bir tane yeter”
        Kurye kurye1 = new Kurye(gun.subList(0, 3), planli);
        Kurye kurye2 = new Kurye(gun.subList(3, 6), planli);
        System.out.println("— 1. kurye —");
        kurye1.teslimEt();
        System.out.println("— 2. kurye —");
        kurye2.teslimEt();
        System.out.println("— 1. kurye —");
        kurye1.teslimEt();
    }
}
