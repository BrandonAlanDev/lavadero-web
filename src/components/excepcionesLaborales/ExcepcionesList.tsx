"use client";

import { useState, useTransition } from "react";
import { deleteExcepcion, softDeleteExcepcion } from "@/actions/excepcionesLaborales.actions";
import ExcepcionForm from "./ExcepcionesForm";

type Excepcion = {
  id: string;
  motivo: string;
  desde: Date;
  hasta: Date;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ExcepcionesListProps = {
  excepciones: Excepcion[];
};

export default function ExcepcionesList({ excepciones }: ExcepcionesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta excepción?")) return;
    
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteExcepcion(id);
      setDeletingId(null);

      if (!result.success) {
        alert(result.error);
      }
    });
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas desactivar esta excepción?")) return;
    
    setDeletingId(id);
    startTransition(async () => {
      const result = await softDeleteExcepcion(id);
      setDeletingId(null);

      if (!result.success) {
        alert(result.error);
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (excepciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No hay excepciones laborales registradas</p>
        <p className="text-gray-400 text-sm mt-2">Crea una nueva excepción usando el formulario</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {excepciones.map((excepcion) => (
        <div
          key={excepcion.id}
          className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
            !excepcion.estado ? 'opacity-50' : ''
          }`}
        >
          {editingId === excepcion.id ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar Excepción</h3>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ExcepcionForm
                excepcion={excepcion}
                onClose={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {excepcion.motivo}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        excepcion.estado
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {excepcion.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Desde:</span>{' '}
                      {formatDate(excepcion.desde)}
                    </p>
                    <p>
                      <span className="font-medium">Hasta:</span>{' '}
                      {formatDate(excepcion.hasta)}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Creado: {formatDate(excepcion.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingId(excepcion.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={deletingId === excepcion.id}
                  >
                    Editar
                  </button>
                  
                  {excepcion.estado && (
                    <button
                      onClick={() => handleSoftDelete(excepcion.id)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      disabled={deletingId === excepcion.id}
                    >
                      {deletingId === excepcion.id ? 'Desactivando...' : 'Desactivar'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(excepcion.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    disabled={deletingId === excepcion.id}
                  >
                    {deletingId === excepcion.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}