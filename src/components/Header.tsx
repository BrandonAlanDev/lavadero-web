"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Car, DoorOpen } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import { useBooking } from "@/app/context/Booking";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  const { onOpen } = useBooking();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass shadow-md w-full"
    >
      <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
        <Link href="/" className="flex items-center gap-2">
          <Car className="w-7 h-7 text-primary" />
          <span className="text-xl font-semibold text-foreground">
            Auto<span className="text-primary">Shine</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#servicios" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Servicios
          </Link>

          <Link href="#nosotros" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Nosotros
          </Link>

          <Link href="#ubicacion" className=" cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ubicación
          </Link>

          <Link href="" className="cursor-pointer">
            <Button variant="celeste" size="sm" onClick={onOpen}>
                Turnos
            </Button>
          </Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Hola, {session.user?.name}</span>
            <form action={handleSignOut}>
              <button type="submit" className="text-white text-sm cursor-pointer"><Button variant="celeste" size="sm">Salir</Button></button>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline-celeste" size="sm">
              <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
            </Button>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
