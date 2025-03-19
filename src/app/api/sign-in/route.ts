import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const { username, password } = await request.json();
    
    // Find user by username
    const user = await UserModel.findOne({ username });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please verify your account before signing in",
          username: user.username
        },
        { status: 403 }
      );
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
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
          bio: user.bio
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