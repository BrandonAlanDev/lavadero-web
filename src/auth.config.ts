import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user){
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.telefono = (user as any).telefono;
      } 
      return token;
    },
    session({ session, token }) {
      if (session.user){
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.telefono = token.telefono as string | null;
      } 

      return session;
    },
  },
} satisfies NextAuthConfig;