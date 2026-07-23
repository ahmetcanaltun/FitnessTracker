import { WifiOff } from "lucide-react";

// Service worker bu sayfayı önceden saklar; ağ yokken gezinme buraya düşer.
export default function OfflinePage() {
  return (
    <div className="max-w-sm mx-auto px-6 pt-32 pb-10 flex flex-col items-center text-center">
      <div
        className="plate-badge mb-5"
        style={{ background: "var(--color-surface-2)", color: "var(--color-muted)" }}
      >
        <WifiOff size={20} />
      </div>
      <h1 className="font-display text-3xl mb-2">BAĞLANTI YOK</h1>
      <p className="text-sm text-muted">
        Kayıtların sunucuda tutuluyor, bu yüzden çevrimdışıyken gösterilemiyor.
        Bağlantı gelince kaldığın yerden devam edebilirsin.
      </p>
    </div>
  );
}
