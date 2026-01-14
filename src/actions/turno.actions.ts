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
            estado: true,
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
                        vehiculo: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        servicio: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                horarioReservado: 'asc'
            }
        });
        return {
            success: true,
            data: turnos
        };
    } catch (error) {
        return {
            error: "Error al obtener los turnos",
            success: false
        };
    }
}

export async function createTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {    
    try {
        const vehiculoServicioId = formData.get("vehiculoServicioId") as string;
        const userId = formData.get("userId") as string;
        const horarioReservado = formData.get("horarioReservado") as string;
        const patente = formData.get("patente") as string;

        // Validaciones
        if (!vehiculoServicioId || !userId || !horarioReservado || !patente) {
            return {
                error: "Todos los campos son requeridos",
                success: false
            };
        }

        // Obtener el vehiculoServicio para congelar precios
        const vehiculoServicio = await prisma.vehiculo_servicio.findUnique({
            where: { id: vehiculoServicioId }
        });

        if (!vehiculoServicio) {
            return {
                error: "Configuración de vehículo x servicio no encontrada",
                success: false
            };
        }

        // Verificar si ya existe un turno en ese horario
        const horario = new Date(horarioReservado);
        const turnoExistente = await prisma.turno.findFirst({
            where: {
                horarioReservado: horario,
                estado: true
            }
        });

        if (turnoExistente) {
            return {
                error: "Ya existe un turno reservado en ese horario",
                success: false
            };
        }

        const nuevoTurno = await prisma.turno.create({
            data: {
                id: crypto.randomUUID(),
                vehiculoServicioId,
                userId,
                horarioReservado: horario,
                precioCongelado: vehiculoServicio.precio,
                seniaCongelada: vehiculoServicio.senia,
                patente: patente.toUpperCase(),
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
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

        return {
            success: true,
            data: nuevoTurno
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Error desconocido",
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
        const horarioReservado = formData.get("horarioReservado") as string;
        const patente = formData.get("patente") as string;

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

        // Verificar si el nuevo horario está disponible
        if (horarioReservado) {
            const horario = new Date(horarioReservado);
            const turnoExistente = await prisma.turno.findFirst({
                where: {
                    horarioReservado: horario,
                    estado: true,
                    id: { not: id } // Excluir el turno actual
                }
            });

            if (turnoExistente) {
                return {
                    error: "Ya existe un turno reservado en ese horario",
                    success: false
                };
            }
        }

        const turnoActualizado = await prisma.turno.update({
            where: { id },
            data: {
                ...(horarioReservado && { horarioReservado: new Date(horarioReservado) }),
                ...(patente && { patente: patente.toUpperCase() }),
                updatedAt: new Date()
            },
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

        return {
            success: true,
            data: turnoActualizado
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Error desconocido",
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
                estado: false,
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


        return {
            success: true,
            data: { configuraciones, usuarios }
        };
    } catch (error) {
        return {
            error: "Error al obtener datos",
            success: false
        };
    }
}