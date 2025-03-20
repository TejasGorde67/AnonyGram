import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
  }

  interface Session {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      email: string;
      isAcceptingMessages?: boolean;
    } & DefaultSession["user"];
  }

  interface JWT {
    _id: string;
    username: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
  }
}
