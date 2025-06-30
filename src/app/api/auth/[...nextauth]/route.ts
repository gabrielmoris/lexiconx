import NextAuth, { NextAuthOptions, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb/mongodb";
import User, { IUser } from "@/lib/mongodb/models/user";

// Extend the NextAuth User type with your custom 'dbId'
// This ensures 'user.dbId' is recognized in callbacks
declare module "next-auth" {
  interface User extends DefaultUser {
    dbId?: string; // Make it optional as it might not be present initially
  }
  interface Session {
    user?: DefaultUser & { id?: string };
  }
}

// Extend NextAuth's JWT type
declare module "next-auth/jwt" {
  interface JWT {
    dbId?: string;
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  // debug: true,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile }) {
      await connectDB();

      try {
        if (!user.email) {
          console.error("Sign-in attempt without email.");
          return false;
        }

        let existingUser: IUser | null = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            googleID: user.id,
          });
          console.log("New user created:", existingUser.email);
        }

        user.dbId = existingUser?._id?.toString();

        return true;
      } catch (error) {
        console.error("Error during NextAuth signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.dbId = user.dbId;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
