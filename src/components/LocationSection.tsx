"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";
import { useState, useEffect, use } from "react";
import { getHorariosCompactos } from "@/actions/margenesHorario.actions";


export function LocationSection() {
  const [cargando,setCargando] = useState(true);
  const [horarios,setHorarios] = useState(["Cargando..."]);
  useEffect(() => {
    try {
      getHorariosCompactos().then((res) => {
        if (res.length > 0 ) {
        setHorarios(res);
        } else {
          setHorarios(["Cerrado"]);
        }
    });
    }catch(error){
      setHorarios(["Error al cargar horarios"]);
    }finally{
      setCargando(false);
    }
  },[])
  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-celeste/10 justify-center items-center mx-auto">
      <div className="container justify-around items-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 justify-around items-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nuestra <span className="text-celeste-dark">Ubicación</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Visitanos y dejá tu vehículo en las mejores manos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center justify-center px-2 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 items-center justify-center w-full md:max-w-[35vw] mx-auto "
          >
            <div className="flex gap-4 p-6 rounded-xl bg-white border border-celeste/20 shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dirección</h3>
                <p className="text-muted-foreground">Av. Montreal 1118, Santa Clara del Mar</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Phone className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                <p className="text-muted-foreground">+54 2234 39-8429</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Clock className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horarios</h3>
                {cargando ? (
                  <p className="text-muted-foreground">Cargando horarios...</p>
                ) : (
                  horarios.map((horario, index) => (
                    <p key={index} className="text-muted-foreground">
                      {horario}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden border border-celeste/20 h-[400px] bg-white  shadow-2xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1575.654469426551!2d-57.51808311571055!3d-37.82965279424021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584d17d73960711%3A0x2e3eb03a5f14c0d!2sAv.%20Montreal%201118%2C%20B7609%20Santa%20Clara%20del%20Mar%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1769111646685!5m2!1ses-419!2sar"
              width="600" 
              height="450" 
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación AutoShine"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
