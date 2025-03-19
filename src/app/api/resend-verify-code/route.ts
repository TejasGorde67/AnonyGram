import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email } = await request.json();
    
    console.log("Resending verification code for:", { username, email });
    
    // Find the user
    const user = await UserModel.findOne({ 
      username,
      email
    });
    
    if (!user) {
      console.log("No account found with this username and email");
      return Response.json(
        { 
          success: false, 
          message: "No account found with this username and email" 
        },
        { status: 404 }
      );
    }
    
    console.log("User found for resending code:", { 
      id: user._id, 
      username: user.username,
      isVerified: user.isVerified
    });
    
    // Generate new verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log("Generated new verification code:", {
      newCode: verifyCode,
      newExpiry: verifyCodeExpiry.toISOString()
    });
    
    // Update user with new code
    user.verifyCode = verifyCode;
    user.verifyCodeExpiry = verifyCodeExpiry;
    await user.save();
    
    // Send email with new code
    const emailResult = await sendVerificationEmail(email, username, verifyCode);
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult);
      return Response.json(
        { 
          success: false, 
          message: "Failed to send verification email. Please try again." 
        },
        { status: 500 }
      );
    }
    
    console.log("Verification email sent successfully");
    return Response.json(
      { 
        success: true, 
        message: "New verification code sent to your email" 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error resending verification code:", error);
    return Response.json(
      { success: false, message: "Error processing your request" },
      { status: 500 }
    );
  }
}