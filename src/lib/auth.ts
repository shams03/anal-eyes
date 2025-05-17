import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";

// Extend the Session type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      console.log("token", token);

      return session;
    },
    async jwt({ token, user }) {
      console.log("JWT Callback:", { token, user });
      // Check if it's the first sign-in (when `user` is available)
      if (user) {
        // Find the user in the database based on their email
        const dbUser = await prisma.user.findFirst({
          where: {
            email: user.email as string,
          },
        });
        console.log("dbUser", dbUser);
        console.log("user", user);

        // If the user doesn't exist in the database, create one or handle accordingly
        if (!dbUser) {
          // Here, if the user doesn't exist, you can assign data to `token` directly
          token.id = user.id; // You can map this to your database model
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        } else {
          // If the user exists, make sure to load data into the token
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
  },
  debug: true,
};
