"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export async function getTurnos(params?: {
    userId?: string;
    fecha?: Date;
}): Promise<ActionState> {
    try {
        const where = {
            estado: 1,
            ...(params?.userId && { userId: params.userId }),
            ...(params?.fecha && {
                horarioReservado: {
                    gte: new Date(params.fecha.setHours(0, 0, 0, 0)),
                    lt: new Date(params.fecha.setHours(23, 59, 59, 999))
                }
            })
        };

        const turnos = await prisma.turno.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                vehiculo_servicio: {
                    include: {
                        vehiculo: { select: { id: true, nombre: true } },
                        servicio: { select: { id: true, nombre: true } }
                    }
                }
            },
            orderBy: {
                horarioReservado: 'asc'
            }
        });

        const safeTurnos = turnos.map((turno) => ({
            ...turno,
            precioCongelado: Number(turno.precioCongelado),
            seniaCongelada: Number(turno.seniaCongelada),
            
            vehiculo_servicio: {
                ...turno.vehiculo_servicio,
                precio: Number(turno.vehiculo_servicio.precio),
                senia: Number(turno.vehiculo_servicio.senia),
                descuento: turno.vehiculo_servicio.descuento ? Number(turno.vehiculo_servicio.descuento) : 0,
            }
        }));

        return {
            success: true,
            data: safeTurnos
        };
    } catch (error) {
        console.error(error); // Good to log the actual error on server
        return {
            error: "Error al obtener los turnos",
            success: false
        };
    }
}

// --- HELPER FUNCTIONS para hacer mas facil la logica compleja de turnos ---

// Convierte "HH:mm" a minutos desde las 00:00 para comparar fácil
function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Obtiene los minutos desde las 00:00 de un objeto Date
function getMinutesFromDate(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
}

export async function createTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const vehiculoServicioId = formData.get("vehiculoServicioId") as string;
        const userId = formData.get("userId") as string;
        const horarioReservadoStr = formData.get("horarioReservado") as string;
        const patente = formData.get("patente") as string;

        // 1. Validaciones Básicas
        if (!vehiculoServicioId || !userId || !horarioReservadoStr || !patente) {
            return { error: "Todos los campos son requeridos", success: false };
        }

        const fechaSolicitadaInicio = new Date(horarioReservadoStr);
        const ahora = new Date();

        // 2. Validación: Fecha pasada o muy cercana (mínimo 5 minutos de antelación para evitar condiciones de carrera o "0 diferencia")
        const diferenciaEnMinutos = (fechaSolicitadaInicio.getTime() - ahora.getTime()) / 60000;
        
        if (diferenciaEnMinutos <= 0) {
            return { error: "No puedes reservar en una fecha/hora pasada.", success: false };
        }
        // Opcional: poner un margen mínimo (ej: 10 min antes)
        if (diferenciaEnMinutos < 10) {
            return { error: "Debes reservar con al menos 10 minutos de anticipación.", success: false };
        }

        // Obtener configuración del servicio (para saber duración)
        const vehiculoServicio = await prisma.vehiculo_servicio.findUnique({
            where: { id: vehiculoServicioId },
            select: { duracion: true, precio: true, senia: true } // Solo traemos lo necesario
        });

        if (!vehiculoServicio) {
            return { error: "Servicio no encontrado", success: false };
        }

        // Calculamos la hora de fin del turno solicitado
        const duracionSolicitada = vehiculoServicio.duracion;
        const fechaSolicitadaFin = new Date(fechaSolicitadaInicio.getTime() + duracionSolicitada * 60000);

        // 3. Obtener Datos de Contexto (Paralelizado para velocidad)
        // Necesitamos: 
        // A) Día laboral correspondiente (0=Domingo, 1=Lunes...)
        // B) Excepciones que choquen con la fecha
        // C) Turnos existentes en ESE día para verificar choques finos
        
        const diaSemanaIndex = fechaSolicitadaInicio.getDay(); // 0 a 6
        
        // Definimos el rango del día completo para buscar turnos (00:00 a 23:59 del día solicitado)
        const inicioDia = new Date(fechaSolicitadaInicio); inicioDia.setHours(0,0,0,0);
        const finDia = new Date(fechaSolicitadaInicio); finDia.setHours(23,59,59,999);

        const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
            // A. Configuración del día laboral
            prisma.dia_laboral.findFirst({
                where: { dia: diaSemanaIndex, estado: true },
                include: { margenes: { where: { estado: true } } }
            }),
            // B. Excepciones que engloben nuestro horario
            prisma.expeciones_laborales.findMany({
                where: {
                    estado: true,
                    // Si el rango de la excepción se solapa con el rango del turno
                    desde: { lte: fechaSolicitadaFin },
                    hasta: { gte: fechaSolicitadaInicio }
                }
            }),
            // C. Turnos ya agendados ese día (Estado 1 = Activo)
            prisma.turno.findMany({
                where: {
                    estado: 1, // Prisma boolean mapeado a 1
                    horarioReservado: {
                        gte: inicioDia,
                        lte: finDia
                    }
                },
                include: {
                    vehiculo_servicio: { select: { duracion: true } }
                }
            })
        ]);

        // 4. Validación: Excepciones Laborales (Feriados, vacaciones, etc)
        if (excepciones.length > 0) {
            return { error: `Fecha no disponible por excepción: ${excepciones[0].motivo}`, success: false };
        }

        // 5. Validación: Horario Laboral (Día y Márgenes)
        if (!diaLaboralConfig) {
            return { error: "El negocio permanece cerrado este día de la semana.", success: false };
        }

        const minutosInicioSolicitud = getMinutesFromDate(fechaSolicitadaInicio);
        const minutosFinSolicitud = getMinutesFromDate(fechaSolicitadaFin);

        // Verificar si el turno cae DENTRO de algún margen laboral (ej: 08:00 a 12:00)
        // Nota: El turno debe empezar Y terminar dentro del mismo margen (no puede quedar cortado al cierre)
        const entraEnMargen = diaLaboralConfig.margenes.some((margen) => {
            const margenInicio = timeToMinutes(margen.desde);
            const margenFin = timeToMinutes(margen.hasta);
            
            return minutosInicioSolicitud >= margenInicio && minutosFinSolicitud <= margenFin;
        });

        if (!entraEnMargen) {
            return { error: "El horario seleccionado está fuera de los márgenes laborales o excede la hora de cierre.", success: false };
        }

        // 6. Validación: Superposición con otros turnos (Overlap)
        // Lógica: (StartA < EndB) y (EndA > StartB)
        const hayChoque = turnosDelDia.some((turnoExistente) => {
            const inicioExistente = new Date(turnoExistente.horarioReservado);
            const finExistente = new Date(inicioExistente.getTime() + turnoExistente.vehiculo_servicio.duracion * 60000);

            return (fechaSolicitadaInicio < finExistente && fechaSolicitadaFin > inicioExistente);
        });

        if (hayChoque) {
            return { error: "El horario ya está ocupado por otro turno en ese intervalo.", success: false };
        }

        // --- CREACIÓN DEL TURNO ---
        // Si llegamos aquí, todas las validaciones pasaron

        const nuevoTurno = await prisma.turno.create({
            data: {
                id: crypto.randomUUID(),
                vehiculoServicioId,
                userId,
                horarioReservado: fechaSolicitadaInicio,
                // Prisma Decimal espera string o number
                precioCongelado: vehiculoServicio.precio, 
                seniaCongelada: vehiculoServicio.senia,
                patente: patente.toUpperCase(),
                estado: 1, // true para booleano
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // Incluimos relaciones solo si necesitamos devolverlas al front
            include: {
                user: true,
                vehiculo_servicio: {
                    include: {
                        vehiculo: true,
                        servicio: true
                    }
                }
            }
        });

        revalidatePath("/turno");
        
        // Conversión manual de Decimal a Number para evitar el error de serialización
        const turnoSafe = {
            ...nuevoTurno,
            precioCongelado: Number(nuevoTurno.precioCongelado),
            seniaCongelada: Number(nuevoTurno.seniaCongelada),
            vehiculo_servicio: {
                ...nuevoTurno.vehiculo_servicio,
                precio: Number(nuevoTurno.vehiculo_servicio.precio),
                senia: Number(nuevoTurno.vehiculo_servicio.senia),
                descuento: Number(nuevoTurno.vehiculo_servicio.descuento)
            }
        };

        return {
            success: true,
            data: turnoSafe
        };

    } catch (error) {
        console.error("Error creando turno:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido al procesar el turno",
            success: false
        };
    }
}

export async function actualizarTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const id = formData.get("id") as string;
        const horarioReservadoStr = formData.get("horarioReservado") as string;
        const patente = formData.get("patente") as string;

        if (!id) return { error: "ID no proporcionado", success: false };

        // 1. Obtener el turno actual para conocer su duración y datos
        const turnoActual = await prisma.turno.findUnique({
            where: { id },
            include: { vehiculo_servicio: true }
        });

        if (!turnoActual) return { error: "Turno no encontrado", success: false };

        // Si no se envió un nuevo horario, usamos el que ya tenía
        const fechaSolicitadaInicio = horarioReservadoStr ? new Date(horarioReservadoStr) : new Date(turnoActual.horarioReservado);
        const duracion = turnoActual.vehiculo_servicio.duracion;
        const fechaSolicitadaFin = new Date(fechaSolicitadaInicio.getTime() + duracion * 60000);
        const ahora = new Date();

        // 2. Validación: Si el horario cambió, validar que no sea pasado
        if (horarioReservadoStr) {
            const diferenciaEnMinutos = (fechaSolicitadaInicio.getTime() - ahora.getTime()) / 60000;
            if (diferenciaEnMinutos < 0) {
                return { error: "No puedes mover un turno a una fecha pasada.", success: false };
            }
        }

        // 3. Obtener Datos de Contexto (Igual que en create)
        const diaSemanaIndex = fechaSolicitadaInicio.getDay();
        const inicioDia = new Date(fechaSolicitadaInicio); inicioDia.setHours(0,0,0,0);
        const finDia = new Date(fechaSolicitadaInicio); finDia.setHours(23,59,59,999);

        const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
            prisma.dia_laboral.findFirst({
                where: { dia: diaSemanaIndex, estado: true },
                include: { margenes: { where: { estado: true } } }
            }),
            prisma.expeciones_laborales.findMany({
                where: {
                    estado: true,
                    desde: { lte: fechaSolicitadaFin },
                    hasta: { gte: fechaSolicitadaInicio }
                }
            }),
            prisma.turno.findMany({
                where: {
                    estado: 1,
                    horarioReservado: { gte: inicioDia, lte: finDia },
                    id: { not: id } // <--- CLAVE: Ignorar el turno que estamos editando
                },
                include: { vehiculo_servicio: { select: { duracion: true } } }
            })
        ]);

        // 4. Validación: Excepciones
        if (excepciones.length > 0) {
            return { error: `Horario no disponible: ${excepciones[0].motivo}`, success: false };
        }

        // 5. Validación: Horario Laboral
        if (!diaLaboralConfig) {
            return { error: "El negocio está cerrado este día.", success: false };
        }

        const minutosInicio = getMinutesFromDate(fechaSolicitadaInicio);
        const minutosFin = getMinutesFromDate(fechaSolicitadaFin);

        const entraEnMargen = diaLaboralConfig.margenes.some((margen) => {
            const margenInicio = timeToMinutes(margen.desde);
            const margenFin = timeToMinutes(margen.hasta);
            return minutosInicio >= margenInicio && minutosFin <= margenFin;
        });

        if (!entraEnMargen) {
            return { error: "El nuevo horario está fuera de la jornada laboral.", success: false };
        }

        // 6. Validación: Choque con otros turnos (Overlap)
        const hayChoque = turnosDelDia.some((t) => {
            const inicioExistente = new Date(t.horarioReservado);
            const finExistente = new Date(inicioExistente.getTime() + t.vehiculo_servicio.duracion * 60000);
            return (fechaSolicitadaInicio < finExistente && fechaSolicitadaFin > inicioExistente);
        });

        if (hayChoque) {
            return { error: "El nuevo horario ya está ocupado.", success: false };
        }

        // 7. Actualización
        const turnoActualizado = await prisma.turno.update({
            where: { id },
            data: {
                horarioReservado: fechaSolicitadaInicio,
                patente: patente ? patente.toUpperCase() : turnoActual.patente,
                updatedAt: new Date()
            },
            include: {
                user: true,
                vehiculo_servicio: { include: { vehiculo: true, servicio: true } }
            }
        });

        revalidatePath("/turno");

        // Convertir Decimal a Number para el Cliente
        return {
            success: true,
            data: {
                ...turnoActualizado,
                precioCongelado: Number(turnoActualizado.precioCongelado),
                seniaCongelada: Number(turnoActualizado.seniaCongelada),
                vehiculo_servicio: {
                    ...turnoActualizado.vehiculo_servicio,
                    precio: Number(turnoActualizado.vehiculo_servicio.precio),
                    senia: Number(turnoActualizado.vehiculo_servicio.senia),
                    descuento: Number(turnoActualizado.vehiculo_servicio.descuento)
                }
            }
        };

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Error al actualizar",
            success: false
        };
    }
}

export async function deleteTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    
    try {
        const id = formData.get("id") as string;

        if (!id) {
            return {
                error: "ID no proporcionado",
                success: false
            };
        }

        const existe = await prisma.turno.findUnique({
            where: { id }
        });

        if (!existe) {
            return {
                error: "Turno no encontrado",
                success: false
            };
        }

        await prisma.turno.update({
            where: { id },
            data: {
                estado: 0,
                updatedAt: new Date()
            }
        });

        revalidatePath("/turno");

        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Error desconocido",
            success: false
        };
    }
}

// Función auxiliar para obtener configuraciones disponibles y usuarios
export async function obtenerDatosParaTurno(): Promise<ActionState> {
    try {
        const [configuraciones, usuarios] = await Promise.all([
            prisma.vehiculo_servicio.findMany({
                where: { estado: true },
                include: {
                    vehiculo: {
                        select: { id: true, nombre: true }
                    },
                    servicio: {
                        select: { id: true, nombre: true }
                    }
                },
                orderBy: [
                    { vehiculo: { nombre: 'asc' } },
                    { servicio: { nombre: 'asc' } }
                ]
            }),
            prisma.user.findMany({
                select: { 
                    id: true, 
                    name: true, 
                    email: true 
                },
                orderBy: { name: 'asc' }
            })
        ]);

        const configuracionesPlanas = configuraciones.map((config) => ({
            ...config,
            precio: Number(config.precio),
            senia: Number(config.senia),
            descuento: config.descuento ? Number(config.descuento) : 0,
        }));

        return {
            success: true,
            data: { 
                configuraciones: configuracionesPlanas,
                usuarios 
            }
        };
    } catch (error) {
        console.error("Error en obtenerDatosParaTurno:", error);
        return {
            error: "Error al obtener datos",
            success: false
        };
    }
}