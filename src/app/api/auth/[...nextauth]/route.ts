import { authOptions } from "@/lib/auth/nextAuthOptions";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
