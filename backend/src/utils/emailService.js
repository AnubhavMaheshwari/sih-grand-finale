import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWelcomeEmail = async (email, userId, password) => {
  try {
    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to SARTHI Portal - Account Created",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Welcome to SARTHI Portal</h2>
            <p>Hello,</p>
            <p>Your account has been successfully created on the SARTHI Portal.</p>
            <p>You can now login using the following credentials:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            <p>Please login and change your password immediately for security purposes.</p>
            <p>Best regards,<br>The SARTHI Team</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otpCode) => {
  try {
    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SARTHI Portal - Password Reset OTP",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for the SARTHI Portal.</p>
            <p>Please use the following OTP (One-Time Password) to reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">This OTP is valid for 10 minutes</p>
            </div>
            <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The SARTHI Team</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent to: " + email);
    return { success: true, message: "OTP email sent successfully" };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordChangedEmail = async (email) => {
  try {
    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SARTHI Portal - Password Changed Successfully",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Password Changed Successfully</h2>
            <p>Hello,</p>
            <p>Your password for the SARTHI Portal has been successfully changed.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately.</p>
            </div>
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Not sharing your password with anyone</li>
              <li>Changing your password regularly</li>
            </ul>
            <p>Best regards,<br>The SARTHI Team</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password change confirmation sent to: " + email);
    return { success: true, message: "Password change confirmation sent" };
  } catch (error) {
    console.error("Error sending password change email:", error);
    return { success: false, error: error.message };
  }
};
