"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export async function create(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const excepcion = await prisma.expeciones_laborales.create({
            data: {
                motivo: formData.get("motivo") as string,
                desde: new Date(formData.get("desde") as string),
                hasta: new Date(formData.get("hasta") as string),
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath("/excepciones");
        return {
            success: true,
            data: excepcion 
        };
    } catch (error) {
        console.error("Error al crear excepción:", error); 
        return {
            error: "Error al crear la excepción laboral",
            success: false
        };
    }
}

export async function getExcepciones(): Promise<ActionState> {
    try {
        const excepciones = await prisma.expeciones_laborales.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: excepciones
        }
    } catch (error) {
        console.error("Error al obtener excepciones:", error); 
        return {
            error: "Error al obtener las excepciones laborales",
            success: false
        }
    }
}