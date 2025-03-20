import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

interface SessionUser {
  _id: string;
  username: string;
  isVerified: boolean;
  email: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please enter your username/email and password");
        }

        await dbConnect();

        const user = await UserModel.findOne({
          $or: [
            { username: credentials.identifier },
            { email: credentials.identifier },
          ],
        });

        if (!user) {
          throw new Error("Invalid username/email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid username/email or password");
        }

        const userDoc = user.toObject() as {
          _id: Types.ObjectId;
          username: string;
          email: string;
          isVerified: boolean;
        };

        return {
          id: userDoc._id.toString(),
          username: userDoc.username,
          email: userDoc.email,
          isVerified: userDoc.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // Redirect to sign-in page on error
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXT_AUTH_SECRET,
});

export { handler as GET, handler as POST };
