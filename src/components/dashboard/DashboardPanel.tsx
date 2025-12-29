"use client";
import { useState } from "react";
import { Button } from "../ui/button";

export default function DashboardPanel({ user }: { user: any }) {
  const [selectedLayout, setSelectedLayout] = useState('info');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        Panel de Control: {selectedLayout}
      </h1>
      
      <div className="flex space-x-4 mb-6">
        <Button 
          variant={selectedLayout === 'info' ? 'celeste' : 'outline'} 
          onClick={() => setSelectedLayout('info')}
        >
          Información
        </Button>
        <Button 
          variant={selectedLayout === 'turnos' ? 'celeste' : 'outline'} 
          onClick={() => setSelectedLayout('turnos')}
        >
          Turnos
        </Button>
      </div>

      {selectedLayout === 'info' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            {/* ... TODO : resto de los campos usando 'user' directamente ... */}
          </div>
        </div>
      )}

      {selectedLayout === 'turnos' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-xl font-semibold mb-4">Mis Próximos Turnos</h2>
           <p className="text-gray-500">Aquí aparecerá la lista de turnos de {user?.name}...</p>
        </div>
      )}
    </div>
  );
}