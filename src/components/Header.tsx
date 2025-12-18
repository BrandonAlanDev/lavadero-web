"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Car } from "lucide-react";

interface HeaderProps {
  onBookingClick: () => void;
}

export function Header({ onBookingClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-2">
          <Car className="w-7 h-7 text-primary" />
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Auto<span className="text-primary">Shine</span>
          </span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Servicios
          </a>
          <a href="#nosotros" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Nosotros
          </a>
          <a href="#ubicacion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ubicación
          </a>
        </nav>

        <Button variant="celeste" size="sm" onClick={onBookingClick}>
          Reservar Turno
        </Button>
      </div>
    </motion.header>
  );
}
