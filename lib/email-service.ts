"use server"

import nodemailer from "nodemailer"
import { generateVerificationToken } from "./auth"

// Configure email transporter
// For production, use a real email service
// For development, you can use services like Mailtrap or Ethereal
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
})
console.log({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email123",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
})

export async function sendVerificationEmail(email: string, name: string) {
  // Generate a verification token
  const token = generateVerificationToken(email)

  // Create verification URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  console.log("baseUrl", baseUrl)
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"DiceyDecisions" <noreply@diceydecisions.com>',
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6d28d9;">Welcome to DiceyDecisions!</h2>
        <p>Hi ${name},</p>
        <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6d28d9;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Thanks,<br>The DiceyDecisions Team</p>
      </div>
    `,
  }

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Verification email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }
}
