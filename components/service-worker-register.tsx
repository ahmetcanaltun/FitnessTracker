"use client";

import { useEffect } from "react";

/**
 * Service worker'ı kaydeder. Yalnızca production'da: dev sunucusunda
 * kayıtlı bir SW, Turbopack'in ürettiği varlıkları eskitip tuhaf
 * önbellek hatalarına yol açıyor.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Kayıt başarısız olursa uygulama normal çalışmaya devam eder
      });
    };

    // Sayfa yüklenmesiyle yarışmasın
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
