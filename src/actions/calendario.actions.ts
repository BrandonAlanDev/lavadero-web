"use server";

import { prisma } from "@/lib/prisma";
import { addMinutes, format, isBefore, isEqual } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type SlotHorario = {
  hora: string;
  disponible: boolean;
  razon?: string;
};

export async function obtenerHorariosDisponibles(
  fechaString: string, // Ej: "2024-05-20"
  vehiculoServicioId: string,
  turnoIdAExcluir?: string
) {
  try {
    // Generamos objetos Date absolutos (UTC) que representan la medianoche y fin del día en Argentina
    const inicioBusqueda = fromZonedTime(`${fechaString} 00:00:00`, TIMEZONE);
    const finBusqueda = fromZonedTime(`${fechaString} 23:59:59`, TIMEZONE);

    // Para saber qué día de la semana es localmente en Argentina
    const diaZonificado = toZonedTime(inicioBusqueda, TIMEZONE);
    const diaSemana = diaZonificado.getDay();

    const configServicio = await prisma.vehiculo_servicio.findUnique({
      where: { id: vehiculoServicioId },
      select: { duracion: true }
    });

    if (!configServicio) throw new Error("Servicio no encontrado");
    const duracion = configServicio.duracion;

    const diaLaboral = await prisma.dia_laboral.findFirst({
      where: { dia: diaSemana, estado: true },
      include: { margenes: { where: { estado: true } } }
    });

    if (!diaLaboral || diaLaboral.margenes.length === 0) {
      return { success: true, horarios: [], mensaje: "El local está cerrado este día" };
    }

    const [excepcionesRaw, turnosRaw] = await Promise.all([
      prisma.expeciones_laborales.findMany({
        where: {
          estado: true,
          AND: [{ desde: { lt: finBusqueda } }, { hasta: { gt: inicioBusqueda } }]
        }
      }),
      prisma.turno.findMany({
        where: {
          estado: 1,
          horarioReservado: { gte: inicioBusqueda, lt: finBusqueda },
          ...(turnoIdAExcluir && { id: { not: turnoIdAExcluir } })
        },
        include: { vehiculo_servicio: { select: { duracion: true } } }
      })
    ]);

    // Prisma devuelve fechas en UTC absolutas. Calculamos el fin de cada turno.
    // No necesitamos convertirlas a Argentina para comparar, las compararemos en UTC
    const turnosExistentes = turnosRaw.map(t => ({
      inicio: t.horarioReservado, 
      fin: addMinutes(t.horarioReservado, t.vehiculo_servicio.duracion)
    }));

    const excepciones = excepcionesRaw.map(e => ({
      desde: e.desde,
      hasta: e.hasta
    }));

    const slotsResultado: SlotHorario[] = [];
    const intervaloGeneracion = 30; // Minutos

    // El momento actual, sin importar dónde corra Vercel, es el mismo instante en el universo :O
    const ahora = new Date(); 

    for (const margen of diaLaboral.margenes) {
      // margen.desde viene como "08:00". Generamos el Date absoluto exacto.
      // Si a fromZonedTime le pasamos el string con la zona, nos da el UTC correcto.
      let iteradorFecha = fromZonedTime(`${fechaString} ${margen.desde}:00`, TIMEZONE);
      const finMargenFecha = fromZonedTime(`${fechaString} ${margen.hasta}:00`, TIMEZONE);

      while (isBefore(addMinutes(iteradorFecha, duracion), finMargenFecha) || 
             isEqual(addMinutes(iteradorFecha, duracion), finMargenFecha)) {
        
        const slotInicio = iteradorFecha;
        const slotFin = addMinutes(slotInicio, duracion);
        
        let disponible = true;
        let razon = "";

        // Comparación ABSOLUTA (Date UTC vs Date UTC)
        const chocaConTurno = turnosExistentes.some(t => (slotInicio < t.fin) && (slotFin > t.inicio));
        const chocaConExcepcion = excepciones.some(e => (slotInicio < e.hasta) && (slotFin > e.desde));
        const esPasado = isBefore(slotInicio, addMinutes(ahora, 15)); // Margen de 15 min

        if (chocaConTurno) { disponible = false; razon = "Ocupado"; }
        else if (chocaConExcepcion) { disponible = false; razon = "Cerrado"; }
        else if (esPasado) { disponible = false; razon = "Pasado"; }

        slotsResultado.push({
          // Solo acá convertimos a Hora Argentina para sacar el texto "HH:mm" que ve el usuario
          hora: format(toZonedTime(slotInicio, TIMEZONE), "HH:mm"), 
          disponible,
          razon
        });

        iteradorFecha = addMinutes(iteradorFecha, intervaloGeneracion);
      }
    }

    const uniqueSlots = new Map();
    slotsResultado.forEach(s => {
      if (!uniqueSlots.has(s.hora) || s.disponible) uniqueSlots.set(s.hora, s);
    });

    const horariosFinales = Array.from(uniqueSlots.values()).sort((a, b) => a.hora.localeCompare(b.hora));

    return { success: true, horarios: horariosFinales };
  } catch (error) {
    console.error("Error al calcular disponibilidad:", error);
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}