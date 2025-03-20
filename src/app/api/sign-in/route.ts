import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { username, password } = await request.json();
    
    console.log("Attempting sign-in for:", username);
    
    // Find user by username
    const user = await UserModel.findOne({ username });
    
    if (!user) {
      console.log("User not found:", username);
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }
    
    console.log("User verification status:", {
      username: user.username,
      isVerified: user.isVerified
    });
    
    // Compare passwords first
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("Invalid password for user:", username);
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }
    
    // If the user exists and password is correct, allow sign in regardless of verification status
    // We'll just log the verification status but not block login
    if (!user.isVerified) {
      console.log("Warning: Unverified user logging in:", username);
    }
    
    // Return success without sensitive data
    return NextResponse.json(
      { 
        success: true, 
        message: "Sign in successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          isVerified: user.isVerified
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