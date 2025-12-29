"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

// Función helper para limpiar y validar URLs de imágenes
function cleanImageUrl(url: string | null): string | null {
    if (!url || url.trim() === '') return null;
    
    let cleaned = url.trim();
    
    // Si contiene "public\\" o "public/", quitarlo y agregar /
    if (cleaned.includes('public\\') || cleaned.includes('public/')) {
        cleaned = cleaned.replace(/^.*public[\\\/]/, '/');
    }
    
    // Si es ruta local de Windows (C:\...), devolver null
    if (cleaned.match(/^[A-Za-z]:\\/)) {
        console.warn('⚠️ Ruta de Windows detectada, no se guardará:', cleaned);
        return null;
    }
    
    // Si es ruta relativa sin /, agregarla
    if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
    }
    
    // Reemplazar \ por /
    cleaned = cleaned.replace(/\\/g, '/');
    
    return cleaned;
}

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
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: servicio
        };

    } catch (error) {
        console.error("❌ ERROR getServicios:", error);
        return {
            error: "Error al obtener los servicios",
            success: false
        }
    }
};

export const createServicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    console.log("=== INICIO createServicio ===");
    
    try {
        const nombre = formData.get('nombre') as string;
        const srcImageRaw = formData.get('srcImage') as string;
        const estadoValue = formData.get('estado');

        console.log("📝 Datos recibidos:");
        console.log("  - nombre:", nombre);
        console.log("  - srcImage (raw):", srcImageRaw);

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del servicio es requerido",
                success: false
            };
        }

        const srcImage = cleanImageUrl(srcImageRaw);
        const estado = estadoValue === 'true';

        console.log("💾 Datos a guardar:");
        console.log("  - nombre:", nombre.trim());
        console.log("  - srcImage (limpio):", srcImage);
        console.log("  - estado:", estado);
        
        const nuevoServicio = await prisma.servicio.create({
            data: {
                id: crypto.randomUUID(),
                nombre: nombre.trim(),
                srcImage: srcImage,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        console.log("✅ Servicio creado exitosamente");

        revalidatePath('/servicio');
        
        return {
            success: true,
            data: nuevoServicio
        };
    } catch (error) {
        console.error("❌ ERROR COMPLETO:", error);
        
        return {
            error: `Error al crear: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const deleteservicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    console.log("=== INICIO deleteservicio ===");
    
    try {
        const id = formData.get('id') as string;
        console.log("ID a eliminar:", id);

        if (!id) {
            return {
                error: "ID no proporcionado",
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
            console.log("❌ Servicio no encontrado");
            return {
                error: "Servicio no encontrado",
                success: false
            };
        }

        const tieneTurnos = servicioExistente.vehiculo_servicio.some(
            (vs: { turno: any[] }) => vs.turno.length > 0
        );

        if (tieneTurnos) {
            console.log("❌ Tiene turnos asociados");
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            }
        }

        await prisma.servicio.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });

        console.log("✅ Servicio dado de baja");

        revalidatePath('/servicio');
        
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        console.error("❌ ERROR deleteservicio:", error);
        return {
            error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};