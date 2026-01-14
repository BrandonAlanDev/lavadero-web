"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface TurnoConRelaciones {
  id: string;
  horarioReservado: Date;
  patente: string;
  estado: boolean;
  precioCongelado: number;
  seniaCongelada: number;
  user: {
    name: string | null;
    email: string;
    telefono?: string | null;
  };
  vehiculo_servicio: {
    precio: number;
    servicio: { nombre: string | null } | null;
    vehiculo: { nombre: string | null } | null;
  };
}

export default function ListaTurnos({
  turnos,
  orderBy,
  orderDir,
}: {
  turnos: TurnoConRelaciones[];
  orderBy?: string;
  orderDir?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const handleSort = (campo: string) => {
    const isActive = orderBy === campo;
    const nextDir = isActive && orderDir === "asc" ? "desc" : "asc";
    
    router.push(
      `/admin?orderBy=${campo}&orderDir=${nextDir}${currentSearch ? `&search=${currentSearch}` : ""}`
    );
  };

  const Header = ({ campo, label }: { campo: string; label: string }) => {
    const isActive = orderBy === campo;
    return (
      <th
        className={`p-2 border cursor-pointer hover:bg-blue-100 transition-colors ${
          isActive ? "bg-blue-50" : "bg-gray-50"
        }`}
        onClick={() => handleSort(campo)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="underline">{label}</span>
          {isActive ? (orderDir === "asc" ? "▲" : "▼") : "↕"}
        </div>
      </th>
    );
  };

  return (
    <section className="space-y-2">
      <div>
        <h2 className="font-semibold text-xl text-gray-800">📋 Gestión de Turnos</h2>
        <p className="text-xs text-gray-500">
          Click en los encabezados para ordenar.
          {orderBy && (
            <span> Ordenando por <strong>{orderBy}</strong> ({orderDir})</span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto shadow-sm border rounded-lg">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="text-gray-700">
            <tr>
              <Header campo="horarioReservado" label="FECHA" />
              <Header campo="name" label="CLIENTE" />
              <Header campo="telefono" label="WHATSAPP" />
              <Header campo="vehiculo" label="VEHÍCULO" />
              <Header campo="servicio" label="SERVICIO" />
              <Header campo="patente" label="PATENTE" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {turnos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                  No se encontraron turnos con esos criterios.
                </td>
              </tr>
            ) : (
              turnos.map((turno) => (
                <tr key={turno.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-2 border font-medium">
                    {new Date(turno.horarioReservado).toLocaleString("es-AR", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="p-2 border">
                    <div className="font-semibold">{turno.user.name || "Invitado"}</div>
                    <div className="text-xs text-gray-500">{turno.user.email}</div>
                  </td>
                  <td className="p-2 border">
                    {turno.user.telefono ? (
                      <Link
                        href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
                        target="_blank"
                        className="text-green-600 font-medium hover:underline flex items-center gap-1"
                      >
                        {turno.user.telefono}
                        <small className="text-[10px]">↗</small>
                      </Link>
                    ) : "No registrado"}
                  </td>
                  <td className="p-2 border uppercase text-[11px] text-gray-600 font-bold">
                    {turno.vehiculo_servicio.vehiculo?.nombre || "—"}
                  </td>
                  <td className="p-2 border text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                      {turno.vehiculo_servicio.servicio?.nombre || "—"}
                    </span>
                  </td>
                  <td className="p-2 border font-mono font-bold text-blue-700 uppercase">
                    {turno.patente}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}