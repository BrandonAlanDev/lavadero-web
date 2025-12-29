"use client";
import { BookingModal } from "@/components/BookingModal";
import { createContext, useContext, useState } from "react";

const BookingContext = createContext({ onOpen: () => {} });

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <BookingContext.Provider value={{ onOpen: () => setIsOpen(true) }}>
      {children}
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);