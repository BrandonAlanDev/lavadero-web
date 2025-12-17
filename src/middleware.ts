import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  
  // Rutas que SIEMPRE redirigen al Dashboard si ya estás logueado
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  // Rutas que REQUIEREN estar logueado (Protegidas)
  const isProtectedRoute = ["/dashboard", "/turnos", "/admin"].some((route) => 
    nextUrl.pathname.startsWith(route)
  );

  if (isApiAuthRoute) return NextResponse.next();

  // Si estás logueado e intentas ir a login/register, te manda al dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Si la ruta es protegida y NO estás logueado, te manda al login
  // callbackUrl sirve para que al loguearse lo devuelva a donde quería ir (ej: /turnos)
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  // Todo lo demás es público
  return NextResponse.next();
});

// Matcher para excluir archivos estáticos
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};