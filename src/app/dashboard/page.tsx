import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) return null; // El middleware ya protege, pero TypeScript lo agradece

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium">{session.user?.name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{session.user?.email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Rol</p>
            <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {session.user?.role}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
             <p className="text-sm text-gray-500">ID de Usuario</p>
             <p className="text-xs font-mono text-gray-600">{session.user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}