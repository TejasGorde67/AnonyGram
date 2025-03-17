import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    
    console.log("Verifying code:", { username: decodedUsername, code, codeType: typeof code });
    
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Log the stored code and expiry for debugging
    console.log("Stored verification data:", {
      storedCode: user.verifyCode,
      codeType: typeof user.verifyCode,
      codeLength: user.verifyCode?.length,
      codeExpiry: user.verifyCodeExpiry,
      currentTime: new Date(),
      isExpired: new Date(user.verifyCodeExpiry) < new Date()
    });

    // Try multiple comparison approaches
    const submittedCode = String(code).trim();
    const storedCode = String(user.verifyCode).trim();
    
    // Try different comparison methods
    const exactMatch = submittedCode === storedCode;
    const numericMatch = Number(submittedCode) === Number(storedCode);
    const normalizedMatch = submittedCode.replace(/\D/g, '') === storedCode.replace(/\D/g, '');
    
    console.log("Code comparison methods:", { 
      submittedCode, 
      storedCode, 
      exactMatch,
      numericMatch,
      normalizedMatch,
      submittedLength: submittedCode.length,
      storedLength: storedCode.length
    });
    
    // Accept any matching method
    const isCodeValid = exactMatch || numericMatch || normalizedMatch;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return Response.json(
        { 
          success: false, 
          message: "Invalid verification code. Please check and try again." 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
