"use client";

import { useState, useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { DiaLaboralForm } from "@/components/diaLaboral/diaLaboralForm";
import { DiaLaboralList } from "@/components/diaLaboral/diaLaboralList";
import { deleteDiaLaboral } from "@/actions/diaLaboral.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type DiaLaboral = {
  id: string;
  estado: boolean;
  dia: number;
  createdAt: Date;
  updatedAt: Date;
};

type DiaLaboralClientProps = {
  initialData: DiaLaboral[];
};

export function DiaLaboralClient({ initialData }: DiaLaboralClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDia, setEditingDia] = useState<DiaLaboral | null>(null);

  const handleCreate = () => {
    setEditingDia(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (dia: DiaLaboral) => {
    setEditingDia(dia);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este día laboral?")) return;

    startTransition(async () => {
      const result = await deleteDiaLaboral(id);

      if (result.success) {
        toast.success("Día laboral eliminado correctamente");
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el día laboral");
      }
    });
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingDia(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleCreate} 
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Nuevo Día Laboral
        </Button>
      </div>

      <DiaLaboralList
        diasLaborales={initialData}
        isLoading={isPending}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-2 shadow-2xl">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/30 rounded-t-2xl" />
          
          {/* Contenido del header con mejor diseño */}
          <DialogHeader className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {editingDia ? "Editar Día Laboral" : "Crear Nuevo Día Laboral"}
                </DialogTitle>
                <DialogDescription className="text-base mt-1.5">
                  {editingDia
                    ? "Modifica la configuración del día seleccionado"
                    : "Define un nuevo día laboral para tu calendario"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {/* Línea separadora */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {/* Formulario */}
          <div className="py-2">
            <DiaLaboralForm
              initialData={editingDia}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}