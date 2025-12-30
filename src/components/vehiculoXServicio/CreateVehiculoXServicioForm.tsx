"use client";

import { createVehiculoXServicio, obtenerVehiculosXServicios } from "@/actions/vehiculoXServicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Vehiculo = {
    id: string;
    nombre: string | null;
};

type Servicio = {
    id: string;
    nombre: string | null;
};

export default function CreateVehiculoXServicioForm() {
    const [state, formAction] = useActionState(createVehiculoXServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatos() {
            const result = await obtenerVehiculosXServicios();
            if (result.success && result.data) {
                setVehiculos(result.data.vehiculos);
                setServicios(result.data.servicios);
            }
            setLoading(false);
        }
        cargarDatos();
    }, []);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            alert("✅ Configuración creada exitosamente!");
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

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Nueva Configuración</h2>
            
            <form ref={formRef} action={formAction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="id_vehiculo" className="block text-sm font-medium mb-1">
                            Tipo de Vehículo *
                        </label>
                        <select
                            id="id_vehiculo"
                            name="id_vehiculo"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccione un vehículo</option>
                            {vehiculos.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="id_servicio" className="block text-sm font-medium mb-1">
                            Servicio *
                        </label>
                        <select
                            id="id_servicio"
                            name="id_servicio"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccione un servicio</option>
                            {servicios.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="duracionMinutos" className="block text-sm font-medium mb-1">
                            Duración (minutos) *
                        </label>
                        <input
                            type="number"
                            id="duracionMinutos"
                            name="duracionMinutos"
                            required
                            min="1"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="30"
                        />
                    </div>

                    <div>
                        <label htmlFor="precio" className="block text-sm font-medium mb-1">
                            Precio *
                        </label>
                        <input
                            type="number"
                            id="precio"
                            name="precio"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="5000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="descuento" className="block text-sm font-medium mb-1">
                            Descuento
                        </label>
                        <input
                            type="number"
                            id="descuento"
                            name="descuento"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label htmlFor="senia" className="block text-sm font-medium mb-1">
                            Seña
                        </label>
                        <input
                            type="number"
                            id="senia"
                            name="senia"
                            min="0"
                            step="0.01"
                            defaultValue="0"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1000"
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
                            ✅ Configuración creada correctamente
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
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? "Creando..." : "Crear Configuración"}
        </button>
    );
}