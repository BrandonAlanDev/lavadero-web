"use client";

import { useEffect, useState } from "react";
import { obtenerHorariosDisponibles } from "@/actions/calendario.actions";

interface Props {
  vehiculoServicioId?: string; // Requerido para calcular duración
  turnoIdAExcluir?: string;    // Para modo edición
  defaultValue?: string;       // ISOString si ya existe
  name: string;                // Nombre para el FormData (ej: "horarioReservado")
}

export default function SeleccionadorHorario({ 
  vehiculoServicioId, 
  turnoIdAExcluir, 
  defaultValue,
  name 
}: Props) {
  const [fecha, setFecha] = useState(defaultValue ? defaultValue.split("T")[0] : "");
  const [horaSeleccionada, setHoraSeleccionada] = useState(defaultValue ? defaultValue.split("T")[1].slice(0, 5) : "");
  const [horariosLibres, setHorariosLibres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Cada vez que cambia la fecha o el servicio, buscamos huecos libres
  useEffect(() => {
    async function actualizarHorarios() {
      if (!fecha || !vehiculoServicioId) return;
      
      setLoading(true);
      const result = await obtenerHorariosDisponibles(fecha, vehiculoServicioId, turnoIdAExcluir);
      
      if (result.success && result.horarios) {
        setHorariosLibres(result.horarios);
      } else {
        setHorariosLibres([]);
      }
      setLoading(false);
    }

    actualizarHorarios();
  }, [fecha, vehiculoServicioId, turnoIdAExcluir]);

  // Si cambia el servicio, reseteamos la hora elegida porque la duración es otra
  useEffect(() => {
    if (!defaultValue) setHoraSeleccionada("");
  }, [vehiculoServicioId]);

  // El valor final que irá al servidor (Date ISO)
  const valorFinal = (fecha && horaSeleccionada) 
    ? new Date(`${fecha}T${horaSeleccionada}:00`).toISOString() 
    : "";

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Programación del Turno
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selector de Día */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={fecha}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setFecha(e.target.value);
              setHoraSeleccionada(""); // Reset hora al cambiar día
            }}
          />
        </div>

        {/* Input Hidden para el Formulario */}
        <input type="hidden" name={name} value={valorFinal} />

        {/* Selector de Horas */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Horarios disponibles</label>
          {!vehiculoServicioId ? (
            <p className="text-sm text-orange-600">⚠️ Primero elija un servicio</p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Buscando huecos...
            </div>
          ) : horariosLibres.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {horariosLibres.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHoraSeleccionada(h)}
                  className={`py-1.5 px-2 text-sm rounded-md transition-colors ${
                    horaSeleccionada === h
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white border hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-500">No hay disponibilidad para este día</p>
          )}
        </div>
      </div>

      {valorFinal && (
        <p className="text-[11px] text-green-600 font-medium">
          Seleccionado: {new Date(valorFinal).toLocaleString()}
        </p>
      )}
    </div>
  );
}