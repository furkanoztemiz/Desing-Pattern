// Bu dosya tools/export-java.js ile js/patterns/adapter/data.js içinden üretildi.
package adapter.cozum;

/**
 * GlobalShip kütüphanesinin istek nesnesi (o da üçüncü parti).
 */
public record ShipmentRequest(String from, String to, double weightLb) {
}
