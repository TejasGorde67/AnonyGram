import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

// Define the User type to match what we're returning
interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  isVerified: boolean;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please enter your username/email and password");
        }

        await dbConnect();

        // Try to find user by username or email
        const user = await UserModel.findOne({
          $or: [
            { username: credentials.identifier },
            { email: credentials.identifier }
          ]
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

        // Use type assertion to fix the TypeScript error
        const userDoc = user.toObject();
        
        // Allow login regardless of verification status
        return {
          id: userDoc._id.toString(),
          _id: userDoc._id.toString(), // Add _id to match User type
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
