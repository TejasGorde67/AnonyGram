import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email?: string;
    isVerified: boolean;
    _id: string;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
  }
}
