"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";

export default function HomeClient() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background justify-center items-center">
      <Header onBookingClick={() => setIsBookingOpen(true)} />

      <main>
        <Hero onBookingClick={() => setIsBookingOpen(true)} />
        <ImageCarousel />
        <AboutSection />
        <LocationSection />
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
