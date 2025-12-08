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
