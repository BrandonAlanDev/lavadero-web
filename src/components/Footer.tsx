"use client";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 border-t border-celeste/20 bg-celeste/5">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              Auto<span className="text-primary">Shine</span>
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} AutoShine. Todos los derechos reservados.
          </p>

          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Términos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
