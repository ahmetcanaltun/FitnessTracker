import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Next 16'da `middleware` -> `proxy` olarak yeniden adlandırıldı; runtime nodejs.
// Buradaki kontrol yalnızca yönlendirme içindir — asıl yetki kontrolü her
// server action / sayfa içinde requireUser() ile tekrar yapılır.
export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";

  if (!session?.user && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session?.user && isLoginPage) {
    return NextResponse.redirect(new URL("/exercises", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Statik dosyalar, auth endpoint'leri ve PWA varlıkları hariç her yol.
    // sw.js ve /offline oturumsuz erişilebilir olmalı: service worker kurulum
    // sırasında /offline'ı önceden saklıyor, yönlendirme yakalarsa /login
    // sayfasını çevrimdışı sayfası sanıp saklardı.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|sw.js|offline).*)",
  ],
};
