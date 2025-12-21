export default function Buscador() {
  return (
    <section className="space-y-1">
      <h2 className="font-semibold">🔍 Buscador</h2>
      <small className="text-gray-500">
        Usa searchParams → filtra en Prisma con contains
      </small>

      <form className="flex gap-2">
        <input
          name="search"
          placeholder="Buscar por marca, modelo o color"
          className="border px-2 py-1 rounded w-64"
        />
        <button className="bg-blue-600 text-white px-3 rounded">
          Buscar
        </button>
      </form>
    </section>
  );
}
