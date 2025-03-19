import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    
    console.log("Verifying code:", { username: decodedUsername, code, codeType: typeof code });
    
    // Fetch user with more detailed logging
    console.log("Finding user with username:", decodedUsername);
    const user = await UserModel.findOne({ username: decodedUsername });
    
    if (!user) {
      console.log("User not found in database");
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found:", { 
      id: user._id, 
      username: user.username,
      hasVerifyCode: !!user.verifyCode
    });

    // Log the stored code and expiry for debugging
    const currentTime = new Date();
    const expiryTime = new Date(user.verifyCodeExpiry);
    const isExpired = currentTime > expiryTime;
    
    console.log("Stored verification data:", {
      storedCode: user.verifyCode,
      codeType: typeof user.verifyCode,
      codeLength: user.verifyCode?.length,
      codeExpiry: expiryTime.toISOString(),
      currentTime: currentTime.toISOString(),
      timeDifference: currentTime.getTime() - expiryTime.getTime(),
      isExpired: isExpired,
      timezoneName: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Try multiple comparison methods
    const submittedCode = String(code).trim();
    const storedCode = String(user.verifyCode).trim();
    
    // Log all possible comparison methods
    console.log("Code comparison methods:", {
      submittedCode,
      storedCode,
      exactMatch: submittedCode === storedCode,
      caseInsensitiveMatch: submittedCode.toLowerCase() === storedCode.toLowerCase(),
      numericMatch: Number(submittedCode) === Number(storedCode),
      submittedLength: submittedCode.length,
      storedLength: storedCode.length
    });

    // Accept any valid comparison method and IGNORE expiration for now
    if (
      submittedCode === storedCode || 
      submittedCode.toLowerCase() === storedCode.toLowerCase() ||
      Number(submittedCode) === Number(storedCode)
    ) {
      user.isVerified = true;
      await user.save();
      console.log("User verified successfully");

      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else {
      console.log("Invalid verification code");
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
