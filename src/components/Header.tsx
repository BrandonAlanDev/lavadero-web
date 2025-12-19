"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Car, DoorOpen } from "lucide-react";
import Link from "next/link";
import { auth, signOut } from "@/auth";

interface HeaderProps {
  onBookingClick: () => void;
}

export function Header({ onBookingClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass justify-center items-center shadow-md shadow-black"
    >
      <div className="container flex items-center justify-around h-16 md:h-20">
        <Link href="#" className="flex items-center gap-2">
          <Car className="w-7 h-7 text-primary" />
          <span className="text-xl font-semibold tracking-tight text-foreground">
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
            <Button variant="celeste" size="sm" onClick={onBookingClick}>
                Reservar Turno
            </Button>
          </Link>
        </nav>

        <Link href="/login" className="flex items-center gap-2 cursor-pointer">
          <Button variant="outline-celeste" size="sm" onClick={onBookingClick}>
            <DoorOpen className="w-4 h-4 mr-2" />
            Iniciar Sesion
          </Button>
        </Link>

      </div>
    </motion.header>
  );
}
