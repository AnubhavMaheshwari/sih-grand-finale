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

export const sendWelcomeEmail = async (email, userId, password, instituteName, fullName) => {
  try {
    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to SARTHI Portal - ${instituteName || 'Account Created'}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Welcome to SARTHI Portal</h2>
            <p>Hello ${fullName || 'User'},</p>
            <p>Your account has been successfully created for <strong>${instituteName || 'your institute'}</strong> on the SARTHI Portal.</p>
            <p>You can now login using the following credentials:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Password:</strong> ${password}</p>
              ${instituteName ? `<p><strong>Institute:</strong> ${instituteName}</p>` : ''}
            </div>
            <p><strong>Important:</strong> Please login and change your password immediately for security purposes.</p>
            <p>You can access the portal at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">${process.env.FRONTEND_URL || 'http://localhost:5173'}</a></p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p>Best regards,<br>The SARTHI Team</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to: " + email);
    return { success: true, message: "Welcome email sent successfully" };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otpCode) => {
  try {
    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SARTHI Portal - OTP Verification Code",
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">OTP Verification Code</h2>
            <p>Hello,</p>
            <p>You have requested an OTP for verification on the SARTHI Portal.</p>
            <p>Please use the following OTP (One-Time Password) to proceed:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">This OTP is valid for 10 minutes</p>
            </div>
            <p>If you did not request this verification, please ignore this email or contact support if you have concerns.</p>
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

export const sendRequestReviewEmail = async (email, requestData, status, comments) => {
  try {
    const statusText = status === "approved" ? "Approved" : "Rejected";
    const statusColor = status === "approved" ? "#10b981" : "#ef4444";

    const mailOptions = {
      from: `SARTHI Portal <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `SARTHI Portal - Request ${statusText}: ${requestData.title}`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Request ${statusText}</h2>
            <p>Hello,</p>
            <p>Your request has been reviewed and <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Request ID:</strong> ${requestData.requestId}</p>
              <p><strong>Title:</strong> ${requestData.title}</p>
              <p><strong>Type:</strong> ${requestData.requestType}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
            </div>
            
            ${comments ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Review Comments:</strong></p>
              <p style="margin: 10px 0 0 0;">${comments}</p>
            </div>
            ` : ''}
            
            <p>You can view the full details of your request by logging into the SARTHI Portal.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/institute/my-requests" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View My Requests</a></p>
            
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The SARTHI Team</p>
          </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Request review email sent to: ${email}`);
    return { success: true, message: "Request review email sent successfully" };
  } catch (error) {
    console.error("Error sending request review email:", error);
    return { success: false, error: error.message };
  }
};
