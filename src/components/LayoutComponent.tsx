"use client";
import { Header } from "@/components/Header";
import { BookingProvider } from "@/app/context/Booking";

export default function LayoutComponent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <BookingProvider>
       <Header session={session} />
       {children}
    </BookingProvider>
  );
}