/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { AdapterUser } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        if (!credentials || !credentials.identifier || !credentials.password) {
          throw new Error("Missing credentials");
        }

        try {
          const query = {
            $or: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          };

          const user = await UserModel.findOne(query).lean();

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err: any) {
          throw new Error(err || "Internal server error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as AdapterUser & {
          isAcceptingMessages?: boolean;
        };
        token._id = typedUser._id?.toString();
        token.isVerified = typedUser.isVerified;
        token.isAcceptingMessages = typedUser.isAcceptingMessages ?? false;
        token.username = typedUser.username;
      }
      return token;
    },
    // Around line 74-79, update the session callback:
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id as string;
        session.user.isVerified = token.isVerified as boolean;
        // Remove or comment out the problematic line
        // session.user.isAcceptingMessages = (token.isAcceptingMessages ?? false) as boolean;
        session.user.username = token.username as string;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
};
