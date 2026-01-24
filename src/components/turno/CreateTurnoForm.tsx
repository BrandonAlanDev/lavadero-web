"use client";

import { createTurno, obtenerDatosParaTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Configuracion = {
    id: string;
    vehiculo: {
        id: string;
        nombre: string | null;
    };
    servicio: {
        id: string;
        nombre: string | null;
    };
    precio: number;
    duracion: number;
};

type Usuario = {
    id: string;
    name: string | null;
    email: string | null;
};

export default function CreateTurnoForm({session} : {session: any}) {
    const [state, formAction] = useActionState(createTurno, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedServicio, setSelectedServicio] = useState<string>("");

    useEffect(() => {
        async function cargarDatos() {
            try {
                const result = await obtenerDatosParaTurno();
                
                if (result.success && result.data) {
                    setConfiguraciones(Array.isArray(result.data.configuraciones) ? result.data.configuraciones : []);
                    setUsuarios(Array.isArray(result.data.usuarios) ? result.data.usuarios : []);
                } else {
                    setError(result.error || "Error al cargar datos");
                }
            } catch (err) {
                console.error("❌ Error al cargar datos:", err);
                setError("Error al cargar datos");
            } finally {
                setLoading(false);
            }
        }
        cargarDatos();
    }, []);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            alert("✅ Turno creado exitosamente!");
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Cargando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium mb-2">{error}</p>
                <Button 
                    onClick={() => window.location.reload()}
                    variant="amarillo"
                    className="text-sm"
                >
                    Intentar de nuevo
                </Button>
            </div>
        );
    }

    if (configuraciones.length === 0 || usuarios.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 font-medium mb-2">⚠️ No hay datos disponibles</p>
                <div className="text-yellow-700 text-sm space-y-1">
                    {configuraciones.length === 0 && (
                        <p>• No hay configuraciones de vehículo x servicio. <a href="/vehiculoXServicio" className="underline">Crear configuraciones</a></p>
                    )}
                    {usuarios.length === 0 && (
                        <p>• No hay usuarios registrados en el sistema.</p>
                    )}
                </div>
            </div>
        );
    }

    // Obtener fecha mínima (hoy)
    const today = new Date();
    const minDate = today.toISOString().slice(0, 16);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Nuevo Turno</h2>
            
            <form ref={formRef} action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium mb-1">
                            Cliente *
                        </label>
                        <select
                            id="userId"
                            name="userId"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {session.user.role === "USER" &&
                                <option value={session.user.id}>
                                    {session.user?.name} {session.user?.email && `(${session.user?.email})`}
                                </option>}
                                {session.user.role === "ADMIN" && <>
                                    <option value="">Seleccione un cliente</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} {u.email && `(${u.email})`}
                                        </option>
                                    ))}
                                </>}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="vehiculoServicioId" className="block text-sm font-medium mb-1">
                            Vehículo y Servicio *
                        </label>
                        <select
                            id="vehiculoServicioId"
                            name="vehiculoServicioId"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e)=>setSelectedServicio(e.target.value)}
                        >
                            <option value="">Seleccione vehículo y servicio</option>
                            {configuraciones.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.vehiculo.nombre} - {c.servicio.nombre} (${c.precio} - {c.duracion}min)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SeleccionadorHorario 
                        name="horarioReservado"
                        vehiculoServicioId={selectedServicio}
                        // turnoIdAExcluir={turno?.id} // Solo si estás editando pero lo dejo de referencia
                        // defaultValue={turno?.horarioReservado} // Solo si estás editando pero lo dejo de referencia
                    />

                    <div>
                        <label htmlFor="patente" className="block text-sm font-medium mb-1">
                            Patente *
                        </label>
                        <input
                            type="text"
                            id="patente"
                            name="patente"
                            required
                            maxLength={10}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                            placeholder="ABC123"
                        />
                    </div>
                </div>

                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-600 text-sm">{state.error}</p>
                    </div>
                )}

                {state.success && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-600 text-sm">
                            ✅ Turno creado correctamente
                        </p>
                    </div>
                )}

                <SubmitButton />
            </form>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    
    return (
        <Button
            type="submit"
            variant={pending?"ghost":"celeste"}
            disabled={pending}
            className="w-full py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? "Creando..." : "Crear Turno"}
        </Button>
    );
}