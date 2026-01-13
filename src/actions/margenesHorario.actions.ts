"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  success: boolean;
  data?: any;
  error?: string;
};

// Crear margen laboral
export async function createMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const diaId = formData.get("diaId") as string;
    const estado = formData.get("estado") === "true";
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    // Validaciones
    if (!diaId) {
      return {
        success: false,
        error: "El día laboral es requerido",
      };
    }

    if (!desde || !hasta) {
      return {
        success: false,
        error: "Las horas desde y hasta son requeridas",
      };
    }

    // Convertir horas a DateTime (usando fecha base)
    const baseDate = new Date("2000-01-01");
    const [desdeHora, desdeMinuto] = desde.split(":");
    const [hastaHora, hastaMinuto] = hasta.split(":");

    const desdeDate = new Date(baseDate);
    desdeDate.setHours(parseInt(desdeHora), parseInt(desdeMinuto), 0, 0);

    const hastaDate = new Date(baseDate);
    hastaDate.setHours(parseInt(hastaHora), parseInt(hastaMinuto), 0, 0);

    // Validar que 'hasta' sea mayor que 'desde'
    if (hastaDate <= desdeDate) {
      return {
        success: false,
        error: "La hora 'hasta' debe ser mayor que la hora 'desde'",
      };
    }

    // Verificar que el día laboral existe
    const diaLaboral = await prisma.dia_laboral.findUnique({
      where: { id: diaId },
    });

    if (!diaLaboral) {
      return {
        success: false,
        error: "Día laboral no encontrado",
      };
    }

    // Verificar solapamientos
    const solapamientos = await prisma.margenes_laborales.findMany({
      where: {
        diaId,
        OR: [
          {
            AND: [
              { desde: { lte: desdeDate } },
              { hasta: { gt: desdeDate } },
            ],
          },
          {
            AND: [
              { desde: { lt: hastaDate } },
              { hasta: { gte: hastaDate } },
            ],
          },
          {
            AND: [
              { desde: { gte: desdeDate } },
              { hasta: { lte: hastaDate } },
            ],
          },
        ],
      },
    });

    if (solapamientos.length > 0) {
      return {
        success: false,
        error: "El horario se solapa con otro margen existente",
      };
    }

    const margen = await prisma.margenes_laborales.create({
      data: {
        diaId,
        estado,
        desde: desdeDate,
        hasta: hastaDate,
      },
    });

    revalidatePath("diaLaboral");

    return {
      success: true,
      data: margen,
    };
  } catch (error) {
    console.error("Error al crear margen laboral:", error);
    return {
      success: false,
      error: "Error al crear el margen laboral",
    };
  }
}

// Actualizar margen laboral
export async function updateMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const diaId = formData.get("diaId") as string;
    const estado = formData.get("estado") === "true";
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    // Validaciones
    if (!id) {
      return {
        success: false,
        error: "ID es requerido",
      };
    }

    if (!desde || !hasta) {
      return {
        success: false,
        error: "Las horas desde y hasta son requeridas",
      };
    }

    // Convertir horas a DateTime
    const baseDate = new Date("2000-01-01");
    const [desdeHora, desdeMinuto] = desde.split(":");
    const [hastaHora, hastaMinuto] = hasta.split(":");

    const desdeDate = new Date(baseDate);
    desdeDate.setHours(parseInt(desdeHora), parseInt(desdeMinuto), 0, 0);

    const hastaDate = new Date(baseDate);
    hastaDate.setHours(parseInt(hastaHora), parseInt(hastaMinuto), 0, 0);

    // Validar que 'hasta' sea mayor que 'desde'
    if (hastaDate <= desdeDate) {
      return {
        success: false,
        error: "La hora 'hasta' debe ser mayor que la hora 'desde'",
      };
    }

    // Verificar que existe
    const existing = await prisma.margenes_laborales.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Margen laboral no encontrado",
      };
    }

    // Verificar solapamientos (excluyendo el actual)
    const solapamientos = await prisma.margenes_laborales.findMany({
      where: {
        id: { not: id },
        diaId,
        OR: [
          {
            AND: [
              { desde: { lte: desdeDate } },
              { hasta: { gt: desdeDate } },
            ],
          },
          {
            AND: [
              { desde: { lt: hastaDate } },
              { hasta: { gte: hastaDate } },
            ],
          },
          {
            AND: [
              { desde: { gte: desdeDate } },
              { hasta: { lte: hastaDate } },
            ],
          },
        ],
      },
    });

    if (solapamientos.length > 0) {
      return {
        success: false,
        error: "El horario se solapa con otro margen existente",
      };
    }

    const margen = await prisma.margenes_laborales.update({
      where: { id },
      data: {
        estado,
        desde: desdeDate,
        hasta: hastaDate,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: margen,
    };
  } catch (error) {
    console.error("Error al actualizar margen laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el margen laboral",
    };
  }
}

// Eliminar margen laboral
export async function deleteMargenLaboral(id: string): Promise<ActionState> {
  try {
    if (!id) {
      return {
        success: false,
        error: "ID es requerido",
      };
    }

    const existing = await prisma.margenes_laborales.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Margen laboral no encontrado",
      };
    }

    await prisma.margenes_laborales.delete({
      where: { id },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: { message: "Margen laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar margen laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el margen laboral",
    };
  }
}

// Obtener márgenes de un día laboral
export async function getMargenesLaborales(diaId: string) {
  try {
    const margenes = await prisma.margenes_laborales.findMany({
      where: { diaId },
      orderBy: { desde: "asc" },
    });

    return margenes;
  } catch (error) {
    console.error("Error al obtener márgenes laborales:", error);
    throw new Error("Error al obtener los márgenes laborales");
  }
}