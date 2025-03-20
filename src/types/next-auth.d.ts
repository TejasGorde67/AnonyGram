import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
    _id?: string | any;
  }

  interface Session extends DefaultSession {
    user: {
      _id: string;
      username: string;
      isVerified: boolean;
      isAcceptingMessages?: boolean;
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
