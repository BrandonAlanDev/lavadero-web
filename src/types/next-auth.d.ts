import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // En la sesión SÍ queremos que sea obligatorio porque ya lo cargamos
      role: string; 
    } & DefaultSession["user"];
  }

  interface User {
    // Aquí lo ponemos OPCIONAL (?) para que no choque con PrismaAdapter al crear usuarios
    role?: string; 
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}