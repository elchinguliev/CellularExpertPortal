// mailer.js
// Sends real emails via Gmail SMTP using Nodemailer.
// Requires EMAIL_USER and EMAIL_PASS (Gmail App Password) in .env

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendWelcomeEmail(toEmail, name) {
  await transporter.sendMail({
    from: `"Cellular Expert Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to Cellular Expert Support',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#5b4feb;">Welcome, ${name}! 👋</h2>
        <p>Your Cellular Expert Support account has been created successfully.</p>
        <p>You can now sign in to ask questions, browse documentation, and open support tickets.</p>
        <p style="color:#888; font-size:12px; margin-top:24px;">
          If you did not create this account, please contact support@cellular-expert.com.
        </p>
      </div>
    `,
  });
}

async function sendPasswordChangedEmail(toEmail, name) {
  await transporter.sendMail({
    from: `"Cellular Expert Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your password was changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#5b4feb;">Password Changed</h2>
        <p>Hi ${name}, your Cellular Expert Support password was just changed.</p>
        <p style="color:#888; font-size:12px; margin-top:24px;">
          If you did not make this change, please contact support@cellular-expert.com immediately.
        </p>
      </div>
    `,
  });
}

async function sendVerificationCode(toEmail, code, purpose) {
  const isReset = purpose === 'reset_password';
  await transporter.sendMail({
    from: `"Cellular Expert Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: isReset ? 'Your password reset code' : 'Verify your email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#5b4feb;">${isReset ? 'Reset Your Password' : 'Verify Your Email'}</h2>
        <p>${isReset ? 'Use this code to reset your password:' : 'Use this code to complete your registration:'}</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; background:#f5f4ff; color:#5b4feb; padding:16px; border-radius:10px; text-align:center; margin:16px 0;">
          ${code}
        </div>
        <p style="color:#888; font-size:12px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendWelcomeEmail, sendPasswordChangedEmail, sendVerificationCode };