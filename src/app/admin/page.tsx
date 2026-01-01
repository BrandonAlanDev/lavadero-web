import Buscador from "../../components/ui/bicicleta/Buscador";
import { obtenerTurnos } from "@/actions/admin.actions";
import ListaTurnos from "@/components/admin/ui/ListaTurnos";
import { Suspense } from "react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    orderBy?: string;
    orderDir?: "asc" | "desc";
  }>;
}) {
  const sp = await searchParams;
  const suspenseKey = `${sp.orderBy}-${sp.orderDir}-${sp.search}`;

  return (
    <main className="mt-12 p-6 gap-5">
      <h1 className="text-2xl font-bold  mb-2">🚗 Gestión de Turnos</h1>
      <Buscador />
      <Suspense key={suspenseKey} fallback={<LoadingOverlay />}>
        <TurnosContainer params={sp} />
      </Suspense>
    </main>
  );
}

async function TurnosContainer({ params }: { params: any }) {
  const turnos = await obtenerTurnos(params);
  return (
    <ListaTurnos 
      turnos={turnos} 
      orderBy={params.orderBy} 
      orderDir={params.orderDir} 
    />
  );
}