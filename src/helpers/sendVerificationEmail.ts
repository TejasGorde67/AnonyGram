import { ApiResponse } from "@/types/ApiResponse";
import { transporter } from "@/lib/nodemailer";
import { customerMailTemplate } from "../../emails/customEmailTemplate";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    // Check if sender email is configured
    if (!process.env.SENDER_EMAIL) {
      console.error("SENDER_EMAIL environment variable is not configured");
      return { success: false, message: "Email configuration error" };
    }

    const htmlContent = customerMailTemplate(username, verifyCode);

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "AnonyGram, Verification Code",
      text: `Your verification code is: ${verifyCode}`,
      html: htmlContent,
    });

    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.error("Error sending verification email:", emailError);
    return { success: false, message: "Failed to send verification email." };
  }
}
