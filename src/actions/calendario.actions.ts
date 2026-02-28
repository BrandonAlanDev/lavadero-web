"use server";

import { prisma } from "@/lib/prisma";
import { addMinutes, format, isBefore, isEqual, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Argentina/Buenos_Aires";

export type SlotHorario = {
  hora: string;
  disponible: boolean;
  razon?: string;
};

export async function obtenerHorariosDisponibles(
  fechaString: string,
  vehiculoServicioId: string,
  turnoIdAExcluir?: string
) {
  try {
    // 1. Configurar fechas límites en UTC para la consulta a Prisma
    // Esto asegura que traigamos todos los turnos del día sin importar el desfase
    const inicioBusqueda = fromZonedTime(`${fechaString} 00:00:00`, TIMEZONE);
    const finBusqueda = fromZonedTime(`${fechaString} 23:59:59`, TIMEZONE);

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

    // NORMALIZACIÓN: Convertimos los turnos de la DB (UTC) a la zona horaria local para comparar
    const turnosExistentes = turnosRaw.map(t => ({
      inicio: toZonedTime(t.horarioReservado, TIMEZONE),
      fin: addMinutes(toZonedTime(t.horarioReservado, TIMEZONE), t.vehiculo_servicio.duracion)
    }));

    const excepciones = excepcionesRaw.map(e => ({
      desde: toZonedTime(e.desde, TIMEZONE),
      hasta: toZonedTime(e.hasta, TIMEZONE)
    }));

    const slotsResultado: SlotHorario[] = [];
    const intervaloGeneracion = 30; 

    for (const margen of diaLaboral.margenes) {
      // Forzamos que el iterador empiece exactamente en la hora del margen en ARG
      let iteradorFecha = fromZonedTime(`${fechaString} ${margen.desde}`, TIMEZONE);
      const finMargenFecha = fromZonedTime(`${fechaString} ${margen.hasta}`, TIMEZONE);

      while (isBefore(addMinutes(iteradorFecha, duracion), finMargenFecha) || 
             isEqual(addMinutes(iteradorFecha, duracion), finMargenFecha)) {
        
        const slotInicio = iteradorFecha;
        const slotFin = addMinutes(slotInicio, duracion);
        let disponible = true;
        let razon = "";

        // Comparación segura (ambos están en la misma zona horaria)
        const chocaConTurno = turnosExistentes.some(t => (slotInicio < t.fin) && (slotFin > t.inicio));
        const chocaConExcepcion = excepciones.some(e => (slotInicio < e.hasta) && (slotFin > e.desde));
        
        const ahora = toZonedTime(new Date(), TIMEZONE);
        const esPasado = slotInicio < addMinutes(ahora, 15);

        if (chocaConTurno) { disponible = false; razon = "Ocupado"; }
        else if (chocaConExcepcion) { disponible = false; razon = "Cerrado"; }
        else if (esPasado) { disponible = false; razon = "Pasado"; }

        slotsResultado.push({
          hora: format(slotInicio, "HH:mm"), 
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
    console.error("Error:", error);
    return { success: false, error: "Error al calcular disponibilidad" };
  }
}