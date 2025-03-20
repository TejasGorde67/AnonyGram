import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email } = await request.json();

    // Find the user
    const user = await UserModel.findOne({
      username,
      email,
    });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate a new verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 24 hours from now
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours
    
    await user.save();

    // Send the verification email
    const emailResult = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResult.success) {
      return Response.json(
        { 
          success: false, 
          message: "Failed to send verification email" 
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Verification code sent successfully. Please check your email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification code:", error);
    return Response.json(
      { success: false, message: "Error sending verification code" },
      { status: 500 }
    );
  }
}
