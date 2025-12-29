import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { da } from "zod/v4/locales";

// Definimos el tipo de respuesta para mantener consistencia
export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export async function createVehiculoXServicio(formData: FormData): Promise<ActionState> {
    try {
        const id_vehiculo = formData.get("id_vehiculo");
        const id_servicio = formData.get("id_servicio");
        const duracionMinutos = formData.get("duracionMinutos");
        const precio = formData.get("precio");
        const descuento = formData.get("descuento");
        const senia = formData.get("senia");

        const data = {
            id: crypto.randomUUID(), // Generar ID único
            vehiculoId: String(id_vehiculo),
            servicioId: String(id_servicio),
            duracion: Number(duracionMinutos),
            precio: Number(precio),
            descuento: Number(descuento || 0),
            senia: Number(senia || 0),
            estado: true,
            updatedAt: new Date()
        };

        const vehiculoServicio = await prisma.vehiculo_servicio.create({ data });

        revalidatePath("/vehiculoServicio");

        return {
            success: true,
            data: vehiculoServicio
        };

    } catch (error) {
        console.error("Error al crear vehiculo_servicio:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido",
            success: false
        };
    }
}
export async function obtenerVehiculoXServicio(params?: {
    search?: string;
    orderBy?: "vehiculo" | "servicio" | "precio" | "createdAt";
    orderDir?: "asc" | "desc";
}) {
    const where = params?.search
        ? {
            OR: [
                {
                    vehiculo: {
                        nombre: {
                            contains: params.search,
                        }
                    }
                },
                {
                    servicio: {
                        nombre: {
                            contains: params.search,
                        }
                    }
                }
            ]
        }
        : undefined;

    const vehiculosXServicios = await prisma.vehiculo_servicio.findMany({
        where,
        orderBy: params?.orderBy
            ? params.orderBy === "vehiculo" || params.orderBy === "servicio"
                ? { [params.orderBy]: { nombre: params.orderDir ?? "asc" } }
                : { [params.orderBy]: params.orderDir ?? "asc" }
            : { createdAt: "desc" },
        include: {
            vehiculo: {
                select: {
                    id: true,
                    nombre: true,
                    srcImage: true
                }
            },
            servicio: {
                select: {
                    id: true,
                    nombre: true,
                    srcImage: true
                }
            }
        }
    });

    return vehiculosXServicios;
}

export async function actualizarVehiculoXServicio(
    formData: FormData
): Promise<ActionState> {
    try {
        const id = formData.get("id");
        
        const data = {
            vehiculoId: String(formData.get("id_vehiculo")),
            servicioId: String(formData.get("servicioId")),
            duracion: Number(formData.get("duracionMinutos")),
            precio: Number(formData.get("precio")),
            descuento: Number(formData.get("descuento") || 0),
            senia: Number(formData.get("senia") || 0),
            updatedAt: new Date() // Actualizar timestamp
        };

        // Verificar que el registro existe antes de actualizar
        const existe = await prisma.vehiculo_servicio.findUnique({
            where: { id: String(id) }
        });

        if (!existe) {
            return {
                error: "Vehículo x Servicio no encontrado",
                success: false
            };
        }

        const vehiculoXServicio = await prisma.vehiculo_servicio.update({
            where: { id: String(id) }, 
            data
        });

        revalidatePath("/vehiculoXServicio");

        return {
            success: true,
            data: vehiculoXServicio
        };

    } catch (error) {
        console.error("Error al actualizar vehiculo_servicio:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido",
            success: false
        };
    }
}
