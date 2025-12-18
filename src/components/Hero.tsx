"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Clock, Shield } from "lucide-react";
import heroImage from "@/assets/hero-carwash.jpg";
import Image from "next/image";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Lavado profesional de vehículos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 pt-20">
        <div className="max-w-2xl">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
          >
            Tu vehículo merece{" "}
            <span className="text-celeste">brillar</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-white/70 mb-8 max-w-lg"
          >
            Reservá tu turno en segundos. Lavado profesional con atención al detalle y productos de primera calidad.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button variant="hero" onClick={onBookingClick}>
              Reservar Turno Ahora
            </Button>
            <Button variant="outline-celeste" size="lg" asChild>
              <a href="#servicios">Ver Servicios</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { icon: Clock, text: "Reserva en 1 minuto" },
              { icon: Shield, text: "Productos premium" },
              { icon: Sparkles, text: "Acabado impecable" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-white/60">
                <item.icon className="w-4 h-4 text-celeste" />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
