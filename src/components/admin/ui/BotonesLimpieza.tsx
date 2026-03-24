"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { limpiarTurnosAntiguos, limpiarTurnosCancelados } from "@/actions/admin.actions";

export default function BotonesLimpieza() {
  const [loadingAntiguos, setLoadingAntiguos] = useState(false);
  const [loadingCancelados, setLoadingCancelados] = useState(false);

  const handleLimpiarAntiguos = async () => {
    if (!window.confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE todos los turnos con más de 2 meses de antigüedad? Esta acción no se puede deshacer.")) {
      return;
    }
    
    setLoadingAntiguos(true);
    const res = await limpiarTurnosAntiguos();
    setLoadingAntiguos(false);

    if (res.success) {
      alert(`✅ Se han eliminado ${res.count} turnos antiguos.`);
    } else {
      alert(`❌ Error: ${res.error}`);
    }
  };

  const handleLimpiarCancelados = async () => {
    if (!window.confirm("⚠️ ¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE todos los turnos cancelados? Esta acción no se puede deshacer.")) {
      return;
    }
    
    setLoadingCancelados(true);
    const res = await limpiarTurnosCancelados();
    setLoadingCancelados(false);

    if (res.success) {
      alert(`✅ Se han eliminado ${res.count} turnos cancelados.`);
    } else {
      alert(`❌ Error: ${res.error}`);
    }
  };

  return (
    <div className="flex gap-3 mt-4 sm:mt-0">
      <Button 
        variant="rojo" 
        onClick={handleLimpiarAntiguos} 
        disabled={loadingAntiguos || loadingCancelados}
      >
        {loadingAntiguos ? "Procesando..." : "Limpiar antiguos"}
      </Button>
      
      <Button 
        variant="rojo" 
        onClick={handleLimpiarCancelados} 
        disabled={loadingCancelados || loadingAntiguos}
      >
        {loadingCancelados ? "Procesando..." : "Limpiar cancelados"}
      </Button>
    </div>
  );
}