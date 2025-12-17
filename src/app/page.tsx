import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // 1. Verificamos la sesión en el servidor
  const session = await auth();

  // 2. Si hay sesión, mandamos al Dashboard
  if (session) {
    redirect("/dashboard");
  }

  // 3. Si NO hay sesión, mandamos al Login
  redirect("/login");
}