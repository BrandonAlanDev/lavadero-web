"use client";

import { registerAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos el estado inicial que coincide con el tipo de retorno de la Server Action
const initialState = {
  error: "",
  success: false,
};

export default function RegisterPage() {
  const router = useRouter();

  // Hook principal para manejar la acción del formulario
  // state: contiene { success, error } devuelto por el servidor
  // action: la función que conectamos al <form>
  // isPending: booleano que indica si se está procesando
  const [state, action, isPending] = useActionState(registerAction, initialState);

  // Efecto para redirigir al usuario cuando el registro es exitoso
  useEffect(() => {
    if (state.success) {
      // Redirigimos al login con un query param para mostrar una alerta opcional allí
      router.push("/login?registered=true");
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 mt-2">
            Únete a nosotros para gestionar tus servicios
          </p>
        </div>

        {/* Botón de Google */}
        <div className="space-y-4">
          <GoogleButton />
        </div>

        {/* Separador Visual */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 uppercase tracking-wide text-xs font-semibold">
              O regístrate con email
            </span>
          </div>
        </div>

        {/* Formulario de Registro */}
        <form action={action} className="space-y-5">
          
          {/* Campo Nombre */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre Completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Campo Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nombre@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Mensaje de Error (si existe) */}
          {state.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-pulse">
              {state.error}
            </div>
          )}

          {/* Botón de Envío con estado de carga */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              </>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        {/* Footer / Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              Inicia Sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}