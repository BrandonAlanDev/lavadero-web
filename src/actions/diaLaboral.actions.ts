"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { promises } from "node:dns";


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
        const dia = parseInt(formData.get("dia") as string);
        const diaLaboral = await prisma.dia_laboral.create({
            data: {
                dia: dia,
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath("/dia"); // Ajusta la ruta según tu app

        return {
            success: true,
            data: diaLaboral
        };
    } catch (error) {
        console.error("Error al crear día laboral:", error);
        return {
            error: "Error al crear el día laboral",
            success: false
        };
    }
}

export async function getDias(): Promise<ActionState> {
    try {
        const dias = await prisma.dia_laboral.findMany({
            include: {
                margenes: {
                    select: {
                        id: true,
                        diaId: true,
                        desde: true,
                        hasta: true,
                        estado: true
                    }
                }
            }
        })

        return {
            success: true,
            data: dias
        }
    } catch (error) {
        return {
            error: "Error al obtener los dias laborales",
            success: false
        }
    }
}