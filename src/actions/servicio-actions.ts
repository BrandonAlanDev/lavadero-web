
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export const getServicios = async (): Promise<ActionState> => {
    try {
        const servicio = await prisma.servicio.findMany({
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
                cratedAt: 'desc'
            }
        });

        return {
            success: true,
            data: servicio
        };

    } catch (error) {
        return {
            error: "Error al obtener los servicios",
            success: false
        }
    }
};

export const createServicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const nombre = formData.get('nombre') as string;
        const srcImage = formData.get('scrImage') as string;
        const estado = formData.get('estado') === 'true';

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }
        const nuevoServicio = await prisma.servicio.create({
            data: {
                id: crypto.randomUUID(), // Generar ID único
                nombre: nombre.trim(),
                srcImage: srcImage || null,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/servicio');
        return {
            success: true,
            data: nuevoServicio
        };
    } catch (error) {
        return {
            error: "Error al crear el servicio. Intente nuevamente",
            success: false
        };
    }
};

export const deleteservicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const id = formData.get('id') as string;
        if (!id) {
            return {
                success: false
            };
        }
        const servicioExistente = await prisma.servicio.findUnique({
            where: { id },
            include: {
                vehiculo_servicio: {
                    include: {
                        turno: true
                    }
                }
            }
        });
        if (!servicioExistente) {
            return {
                success: false
            };
        }
        const tieneTurnos = servicioExistente.vehiculo_servicio.some(
            (vs: { turno: any[] }) => vs.turno.length > 0
        );
        if (tieneTurnos) {
            return { success: false }
        }

        await prisma.servicio.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });
        revalidatePath('/servicio');
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        return {
            error: "Error al eliminar dar de baja el servicio",
            success: false
        };
    }
};