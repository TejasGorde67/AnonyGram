import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      email: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
  }
}
