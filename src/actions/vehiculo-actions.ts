
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export const getVehiculos = async (): Promise<ActionState> => {
    try {
        const vehiculo = await prisma.vehiculo.findMany({
            where: {
                estado: true
            },
            include: {
                vehiculo_servicio: {
                    include: {
                        servicio: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: vehiculo
        };

    } catch (error) {
        return {
            error: "Error al obtener los vehiculos",
            success: false
        }
    }
};

export const createVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const nombre = formData.get('nombre') as string;
        const srcImage = formData.get('scrImage') as string;
        const estado = formData.get('estado') === 'true';

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del vehiculo es requerido",
                success: false
            };
        }
        const nuevoVehiculo = await prisma.vehiculo.create({
            data: {
                id: crypto.randomUUID(), // Generar ID único
                nombre: nombre.trim(),
                srcImage: srcImage || null,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/vehiculo');
        return {
            success: true,
            data: nuevoVehiculo
        };
    } catch (error) {
        return {
            error: "Error al crear el vehiculo. Intente nuevamente",
            success: false
        };
    }
};

export const deleteVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const id = formData.get('id') as string;
        if (!id) {
            return {
                success: false
            };
        }
        const vehiculoExistente = await prisma.vehiculo.findUnique({
            where: { id },
            include: {
                vehiculo_servicio: {
                    include: {
                        turno: true
                    }
                }
            }
        });
        if (!vehiculoExistente) {
            return {
                success: false
            };
        }
        const tieneTurnos = vehiculoExistente.vehiculo_servicio.some(
            (vs:{turno:any[]}) => vs.turno.length > 0
        );
        if (tieneTurnos) {
            return { success: false }
        }

        await prisma.vehiculo.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });
        revalidatePath('/vehiculo');
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        return {
            error: "Error al eliminar dar de baja el vehiculo",
            success: false
        };
    }
};