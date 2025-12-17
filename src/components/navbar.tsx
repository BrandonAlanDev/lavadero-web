import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Home */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          LavaderoWeb
        </Link>

        {/* Links de Navegación */}
        <div className="flex items-center gap-6">
          <Link href="/turnos" className="text-gray-600 hover:text-blue-600">
            Turnos (Protegido)
          </Link>

          {session ? (
            // SI ESTÁ LOGUEADO
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="font-medium text-gray-800">
                Hola, {session.user?.name || "Usuario"}
              </Link>
              
              {/* Botón de Logout (Server Action Inline) */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button type="submit" className="text-red-500 hover:text-red-700 font-medium">
                  Salir
                </button>
              </form>
            </div>
          ) : (
            // SI NO ESTÁ LOGUEADO
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}