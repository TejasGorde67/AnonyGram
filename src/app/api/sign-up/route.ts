import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    // When generating the verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration to 30 minutes instead of 1 hour
    const verifyCodeExpiry = new Date(Date.now() + 30 * 60 * 1000);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        const newUser = new UserModel({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessages: true,
          messages: [],
        });

        await newUser.save();
      } catch (error) {
        return Response.json(
          {
            success: false,
            message: `Error while Signing up user: ${error}`,
          },
          { status: 500 }
        );
      }
    }

    // Around line 75
    const result = await sendVerificationEmail(email, username, verifyCode);
    
    if (!result.success) {
      console.error("Email sending failed:", result.message);
      
      // Still create the user but inform about email issue
      return Response.json(
        {
          success: true,
          message: 'Account created, but we could not send the verification email. Please use the "Send Verification Code" option to get your code.',
        },
        { status: 201 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
}

// When creating a new user, extend the verification code expiry time
const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
// Increase expiration time from 1 hour to 24 hours
const verifyCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);