"use client";
import { loginAction } from "@/actions/auth-actions"; // Importa la acción corregida
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react"; 
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  
  // Pasamos loginAction directamente.
  // El initialState debe coincidir con el tipo ActionState (undefined para opcionales es válido)
  const [state, action, isPending] = useActionState(loginAction, { error: "", success: false });

  // Manejamos la redirección exitosa en el cliente
  useEffect(() => {
    if (state.success) {
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
        </div>

        <div className="space-y-4">
          <GoogleButton />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">O con tu email</span>
          </div>
        </div>

        {/* El action se pasa directo al form */}
        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="password" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {state.error && (
            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg text-center">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-70"
          >
            {isPending ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-600 hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}