"use server";

import { prisma } from "@/lib/prisma"; // Asegúrate de tener configurado tu cliente de prisma
import { addMinutes, areIntervalsOverlapping, format, parse, startOfDay, endOfDay } from "date-fns";

/**
 * Obtiene los turnos disponibles para un día específico
 * @param fecha ISOString del día a consultar
 * @param vehiculoServicioId ID de la configuración (para saber la duración)
 */
export async function obtenerHorariosDisponibles(
  fechaISO: string, 
  vehiculoServicioId: string, 
  turnoIdAExcluir?: string // <--- Nuevo
) {
  try {
    const fechaConsulta = new Date(fechaISO);
    const diaSemana = fechaConsulta.getDay(); // 0 (Dom) a 6 (Sáb)

    // 1. Obtener la duración del servicio solicitado
    const configServicio = await prisma.vehiculo_servicio.findUnique({
      where: { id: vehiculoServicioId },
      select: { duracion: true }
    });

    if (!configServicio) throw new Error("Servicio no encontrado");
    const duracionSolicitada = configServicio.duracion;

    // 2. Obtener la configuración laboral del día (Márgenes)
    const diaLaboral = await prisma.dia_laboral.findFirst({
      where: { dia: diaSemana, estado: true },
      include: { margenes: { where: { estado: true } } }
    });

    if (!diaLaboral || diaLaboral.margenes.length === 0) {
      return { success: true, horarios: [], mensaje: "El lavadero está cerrado este día" };
    }

    // 3. Obtener Excepciones y Turnos existentes para ese día
    const inicioDia = startOfDay(fechaConsulta);
    const finDia = endOfDay(fechaConsulta);

    const [excepciones, turnosExistentes] = await Promise.all([
      prisma.expeciones_laborales.findMany({
        where: {
          estado: true,
          OR: [
            { desde: { lte: finDia }, hasta: { gte: inicioDia } }
          ]
        }
      }),
      prisma.turno.findMany({
        where: {
          horarioReservado: { gte: inicioDia, lte: finDia },
          estado: 1,
          NOT: turnoIdAExcluir ? { id: turnoIdAExcluir } : undefined
        },
        include: { vehiculo_servicio: { select: { duracion: true } } }
      })
    ]);

    // 4. Generar slots de tiempo (cada 30 min por ejemplo) y validar
    const slotsDisponibles: string[] = [];
    const intervaloGeneracion = 30; // Minutos entre cada opción del picker

    for (const margen of diaLaboral.margenes) {
      // Convertir "09:00" a objeto Date de ese día
      let horaActual = parse(margen.desde, "HH:mm", fechaConsulta);
      const horaCierre = parse(margen.hasta, "HH:mm", fechaConsulta);

      while (addMinutes(horaActual, duracionSolicitada) <= horaCierre) {
        const slotInicio = horaActual;
        const slotFin = addMinutes(horaActual, duracionSolicitada);

        // Validar contra Turnos Existentes
        const seSolapaConTurno = turnosExistentes.some(t => {
          const tInicio = new Date(t.horarioReservado);
          const tFin = addMinutes(tInicio, t.vehiculo_servicio.duracion);
          return areIntervalsOverlapping(
            { start: slotInicio, end: slotFin },
            { start: tInicio, end: tFin }
          );
        });

        // Validar contra Excepciones
        const seSolapaConExcepcion = excepciones.some(e => {
          return areIntervalsOverlapping(
            { start: slotInicio, end: slotFin },
            { start: new Date(e.desde), end: new Date(e.hasta) }
          );
        });

        // Si el horario está libre y no ha pasado (si es hoy)
        if (!seSolapaConTurno && !seSolapaConExcepcion && slotInicio > new Date()) {
          slotsDisponibles.push(format(slotInicio, "HH:mm"));
        }

        horaActual = addMinutes(horaActual, intervaloGeneracion);
      }
    }

    return { success: true, horarios: slotsDisponibles };

  } catch (error) {
    console.error("❌ Error en calendario.actions:", error);
    return { success: false, error: "No se pudieron calcular los horarios" };
  }
}