import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { identifier, password } = await request.json();

    console.log("Attempting sign-in for:", identifier);

    // Find user by username or email
    const user = await UserModel.findOne({
      $or: [
        { username: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      console.log("User not found:", identifier);
      return NextResponse.json(
        { success: false, message: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    console.log("User verification status:", {
      username: user.username,
      isVerified: user.isVerified,
    });

    // Compare passwords first
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", identifier);
      return NextResponse.json(
        { success: false, message: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // If the user exists and password is correct, allow sign in regardless of verification status
    // We'll just log the verification status but not block login
    if (!user.isVerified) {
      console.log("Warning: Unverified user logging in:", user.username);
    }

    // Convert to plain object first
    const userObj = user.toObject();

    return NextResponse.json(
      { 
        success: true, 
        message: "Sign in successful",
        user: {
          id: (userObj._id as Types.ObjectId).toString(),
          username: userObj.username,
          email: userObj.email,
          // Use optional chaining and nullish coalescing to safely access properties
          profilePicture: 'profilePicture' in userObj ? userObj.profilePicture : null,
          bio: 'bio' in userObj ? userObj.bio : null,
          isVerified: userObj.isVerified,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      { success: false, message: "Error signing in" },
      { status: 500 }
    );
  }
}
