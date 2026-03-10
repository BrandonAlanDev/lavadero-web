"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Calendar, Clock, Car, 
  Settings, AlertCircle, CheckCircle2, XCircle, ChevronRight,
  Lock, Eye, EyeOff
} from "lucide-react";
import { Button } from "../ui/button";
import { getUserTurnos, updateProfile, cancelTurno, updatePassword  } from "@/actions/user-dashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Definición de tipos basada en lo que devuelve tu action
type TurnoWithDetails = Awaited<ReturnType<typeof getUserTurnos>>[0];

export default function DashboardPanel({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'info' | 'turnos'>('info');
  const [turnos, setTurnos] = useState<TurnoWithDetails[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  useEffect(() => {
  }, []);
  
  // Efecto para cargar turnos cuando se entra a la pestaña
  useEffect(() => {
    if (activeTab === 'turnos') {
      setLoadingTurnos(true);
      getUserTurnos(user.id).then((data) => {
        setTurnos(data);
        setLoadingTurnos(false);
      });
    }
  }, [activeTab, user.id]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-white  border-x-2  mt-[50px] shadow-2xl shadows-black">
      {/* Header del Dashboard */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hola, {user.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Gestiona tu perfil y tus reservas.</p>
        </div>
        
        {/* Navegación de Pestañas (Tabs) */}
        <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm w-fit">
          <TabButton 
            isActive={activeTab === 'info'} 
            onClick={() => setActiveTab('info')} 
            label="Mi Perfil" 
            icon={<User className="w-4 h-4" />}
          />
          <TabButton 
            isActive={activeTab === 'turnos'} 
            onClick={() => setActiveTab('turnos')} 
            label="Mis Turnos" 
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Contenido */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ProfileForm user={user} />
            <PasswordForm user={user} />
          </motion.div>
        ) : (
          <motion.div
            key="turnos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TurnosList turnos={turnos} loading={loadingTurnos} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTES                               */
/* -------------------------------------------------------------------------- */

function TabButton({ isActive, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 z-10 rounded-full text-shadow-md ${
        isActive ? "text-blue-950 bg-amber-200 " : "text-gray-500 hover:text-blue-900 hover:bg-gray-100"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/10 rounded-lg"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon} {label}
      </span>
    </button>
  );
}

function ProfileForm({ user }: { user: any }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState("");


  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfile(user.id, formData);
      
      if (res.success) {
        setStatus('success');
        setMsg(res.message || "Perfil actualizado correctamente.");
        if (res.user){
          await update({
            name: res.user.name,
            telefono: res.user.telefono
          });
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <Settings className="w-5 h-5 text-gray-400" />
          Información Personal
        </h2>
      </div>

      {/* IMPORTANTE: onSubmit en lugar de action */}
      <form onSubmit={handleFormSubmit} className="p-6 md:p-8 grid gap-6 md:grid-cols-2">
        
        {/* Email (Solo lectura) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" /> Email
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm select-all">
            {user.email}
          </div>
        </div>

        {/* Nombre - IMPORTANTE: name="name" */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" /> Nombre Completo
          </label>
          <input
            name="name" 
            defaultValue={user.name}
            type="text"
            required
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Teléfono - IMPORTANTE: name="telefono" */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" /> Teléfono
          </label>
          <input
            name="telefono"
            defaultValue={user.telefono || ''}
            type="text" 
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="+54 ..."
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-4 mt-4">
          {/* Mensajes de Feedback */}
          {status === 'success' && (
            <span className="text-green-600 text-sm flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> {msg}
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-600 text-sm flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-4 h-4" /> {msg || "Error al guardar"}
            </span>
          )}

          <Button 
            disabled={isPending} 
            type="submit" 
            variant="celeste"
            className="min-w-[120px]"
          >
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TurnosList({ turnos, loading }: { turnos: TurnoWithDetails[], loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  // --- LÓGICA DE FECHAS PARA ARGENTINA (UTC-3) ---
  const getArgentinaDateString = (dateInput: Date | string) => {
    // Convertimos a objeto Date y usamos toLocaleDateString con la zona horaria fija
    return new Date(dateInput).toLocaleDateString('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires'
    }); // Retorna "YYYY-MM-DD" en esa zona horaria
  };

  const hoyArgentina = getArgentinaDateString(new Date());

  // Clasificación de turnos
  const turnosHoy = turnos.filter(t => t.estado === 1 && getArgentinaDateString(t.horarioReservado) === hoyArgentina);
  const turnosPendientes = turnos.filter(t => t.estado === 1 && getArgentinaDateString(t.horarioReservado) !== hoyArgentina);
  const turnosCompletados = turnos.filter(t => t.estado === 2);
  const turnosCancelados = turnos.filter(t => t.estado === 0);

  if (turnos.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No tienes turnos</h3>
        <p className="text-gray-500 mb-6">Aún no has reservado ningún servicio.</p>
        <Link href="/turno"><Button variant="celeste">Reservar Turno</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SECCIÓN DE HOY (Solo aparece si hay turnos) */}
      {turnosHoy.length > 0 && (
        <div className="px-2 py-4 bg-blue-50/50 rounded-2xl border-2 border-primary animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-3 px-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <p className="font-bold text-primary uppercase text-sm tracking-wider">Turnos para hoy</p>
          </div>
          <div className="space-y-3">
            {turnosHoy.map((turno) => (
              <TurnoCard key={turno.id} turno={turno}/>
            ))}
          </div>
        </div>
      )}

      {/* RESTO DE SECCIONES */}
      <div className="px-2 py-4 bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-500 mb-3 px-2 text-sm font-medium">Próximos turnos y pendientes</p>
        <div className="space-y-3">
          {turnosPendientes.length > 0 ? (
            turnosPendientes.map((turno) => <TurnoCard key={turno.id} turno={turno} />)
          ) : (
            <p className="text-xs text-gray-400 px-2 italic text-center py-2">No hay más turnos pendientes</p>
          )}
        </div>
      </div>

      <div className="px-2 py-4 bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-500 mb-3 px-2 text-sm font-medium">Completados</p>
        <div className="space-y-3">
          {turnosCompletados.map((turno) => (
            <TurnoCard key={turno.id} turno={turno} />
          ))}
        </div>
      </div>

      <div className="px-2 py-4 bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-gray-500 mb-3 px-2 text-sm font-medium">Cancelados</p>
        <div className="space-y-3">
          {turnosCancelados.map((turno) => (
            <TurnoCard key={turno.id} turno={turno} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TurnoCard({ turno }: { turno: TurnoWithDetails }) {
  const [isCancelling, startCancelling] = useTransition();
  const turnoEstado = turno.estado;
  const isPast = new Date(turno.horarioReservado) < new Date();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  // Formateo de fecha
  const fecha = new Date(turno.horarioReservado);
  const dia = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl border transition-all ${
        turnoEstado === 0
          ? "bg-gray-50 border-gray-100 opacity-75" 
          : turnoEstado === 1 ? "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30"
          : "bg-green-50 border-green-200 shadow-sm hover:shadow-md hover:border-green-300"
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Columna Fecha */}
        <div className={`p-6 flex flex-col justify-center items-center min-w-[140px] border-b md:border-b-0 md:border-r ${
          turnoEstado === 0 ? "bg-gray-100 text-gray-400" : turnoEstado === 2 ? "bg-green-50/50 text-green-700" : "bg-white text-gray-900"
        }`}>
          <span className="text-3xl font-bold">{fecha.getDate()}</span>
          <span className="text-sm font-medium uppercase tracking-wider">{fecha.toLocaleDateString('es-AR', { month: 'short' })}</span>
          <div className="mt-2 text-xs font-semibold bg-white/80 px-2 py-1 rounded-full flex items-center gap-1">
             <Clock className="w-3 h-3" /> {hora}
          </div>
        </div>

        {/* Columna Detalles */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div>
               <h3 className={`font-semibold text-lg ${turnoEstado === 0 ? "text-gray-500 line-through" : "text-gray-900"}`}>
                 {turno.vehiculo_servicio.servicio.nombre}
               </h3>
               <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                 <Car className="w-3 h-3" /> {turno.vehiculo_servicio.vehiculo.nombre} • {turno.patente}
               </p>
            </div>
            {/* Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
              turnoEstado === 0 
                ? "bg-red-100 text-red-700"
                : isPast 
                  ? "bg-gray-100 text-gray-600"
                  : "bg-green-100 text-green-700"
            }`}>
              {turnoEstado === 0 ? (
                <><XCircle className="w-3 h-3" /> Cancelado</>
              ) : turnoEstado === 2 ? (
                <><CheckCircle2 className="w-3 h-3" /> Completado</>
              ) : (
                <><CheckCircle2 className="w-3 h-3" /> Pendiente</>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-sm">
             <div className="flex gap-4 text-gray-500">
               <span>Seña: ${turno.seniaCongelada}</span>
               <span className="font-semibold text-gray-900">Total: ${turno.precioCongelado}</span>
             </div>
             
             {turnoEstado !== 0 && turnoEstado !== 2 && (
               <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                onClick={handleCancel}
                disabled={isCancelling}
               >
                 {isCancelling ? "Cancelando..." : "Cancelar Turno"}
               </Button>
             )}
             {/* Renderizado de Modales Condicional */}
            {showCancelModal && (
                <ConfirmCancelModal 
                    onCancel={() => setShowCancelModal(false)}
                    onConfirm={async ()=>{let res = await cancelTurno(turno.id); setShowCancelModal(false); if (!res.success) { setShowErrorModal(true); } else { turno.estado=0; router.refresh();}}}
                />
            )}

            {showErrorModal && (
                <ModalError 
                    error={"Ocurrió un error inesperado"} 
                    onClose={() => setShowErrorModal(false)} 
                />
            )}
            
            {/* Modal de edición futuro
            {showEditModal && (
                <EditTurnoModal 
                    turno={turno} 
                    onClose={() => setShowEditModal(false)} 
                />
            )}
            */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConfirmCancelModal({ onConfirm, onCancel}: { onConfirm: () => void, onCancel: () => void}) {
    const [isPendingConfirm, setIsPendingConfirm] = useState(false);
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-white text-orange-600 border-2 border-red-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-center align-baseline">
                        ⚠️
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">¿Cancelar Turno?</h3>
                    <p className="text-slate-500 mt-2 text-sm">
                        Esta acción liberará el horario seleccionado. ¿Estás seguro que deseas continuar?
                    </p>
                </div>
                <div className="flex border-t">
                    <button 
                        onClick={onCancel}
                        className="flex-1 p-4 text-slate-600 font-semibold hover:bg-slate-50 transition-colors border-r"
                    >
                        Volver
                    </button>
                    <button 
                        onClick={async () => {setIsPendingConfirm(true); await onConfirm(); setIsPendingConfirm(false);}}
                        disabled={isPendingConfirm}
                        className="flex-1 p-4 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {isPendingConfirm ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal de Error
function ModalError({ error, onClose }: { error: string, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-white text-orange-600 border-2 border-red-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🚫
                </div>
                <h3 className="text-lg font-bold text-slate-800">No se pudo cancelar</h3>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-600 italic">"{error}"</p>
                </div>
                <button 
                    onClick={onClose}
                    className="mt-6 w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-shadow shadow-lg shadow-slate-200"
                >
                    ENTENDIDO
                </button>
            </div>
        </div>
    );
}

function PasswordForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState("");

  // Estados para mostrar/ocultar contraseñas
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const res = await updatePassword(user.id, formData);
      if (res.success) {
        setStatus('success');
        setMsg(res.message);
        form.reset(); // Limpiamos los campos al tener éxito
      } else {
        setStatus('error');
        setMsg(res.message);
      }
      
      // Limpiamos el mensaje después de 4 segundos
      setTimeout(() => setStatus('idle'), 4000);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <Lock className="w-5 h-5 text-gray-400" />
          Seguridad y Contraseña
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Actualiza tu contraseña. Si te registraste con Google, deja la contraseña actual en blanco.
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="p-6 md:p-8 grid gap-6 md:grid-cols-2">
        
        {/* Contraseña Actual */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Contraseña Actual</label>
          <div className="relative">
            <input
              name="oldPassword"
              type={showOld ? "text" : "password"}
              className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nueva Contraseña */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nueva Contraseña</label>
          <div className="relative">
            <input
              name="newPassword"
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirmar Nueva Contraseña */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              required
              minLength={6}
              className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-end gap-4 mt-4">
          {status === 'success' && (
            <span className="text-green-600 text-sm flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> {msg}
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-600 text-sm flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-4 h-4" /> {msg}
            </span>
          )}

          <Button 
            disabled={isPending} 
            type="submit" 
            variant="outline"
            className="min-w-[150px] border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isPending ? "Actualizando..." : "Cambiar Contraseña"}
          </Button>
        </div>
      </form>
    </div>
  );
}