 
// Necesita instalación de html5-qrcode desde CDN o npm
// <script src="https://unpkg.com/html5-qrcode"></script>

export class QRCodeScanner {
    static async scan(targetElementId, callback) {
        const html5QrCode = new Html5Qrcode(targetElementId);
        const config = { fps: 10, qrbox: 250 };

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeMessage => {
                    callback(qrCodeMessage);
                    html5QrCode.stop();
                }
            );
        } catch (err) {
            console.error("Error al iniciar el escáner QR:", err);
        }
    }
}
