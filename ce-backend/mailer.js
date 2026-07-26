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
  const isSupport = purpose === 'support_request';
  const subject = isReset
    ? 'Your password reset code'
    : isSupport
    ? 'Your support request verification code'
    : 'Verify your email';
  const heading = isReset
    ? 'Reset Your Password'
    : isSupport
    ? 'Verify Your Support Request'
    : 'Verify Your Email';
  const intro = isReset
    ? 'Use this code to reset your password:'
    : isSupport
    ? 'Use this code to confirm your support request:'
    : 'Use this code to complete your registration:';

  await transporter.sendMail({
    from: `"Cellular Expert Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#5b4feb;">${heading}</h2>
        <p>${intro}</p>
        <div style="font-size:28px; font-weight:700; letter-spacing:6px; background:#f5f4ff; color:#5b4feb; padding:16px; border-radius:10px; text-align:center; margin:16px 0;">
          ${code}
        </div>
        <p style="color:#888; font-size:12px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

// Sends a confirmed support request straight to the helpdesk inbox
// (customercare@cellular-expert.com). The customer's own email is set as
// Reply-To, so support agents can just hit "Reply" in their helpdesk tool.
async function sendSupportRequest({ email, company, fullName, product, description }, attachments = []) {
  const helpdeskInbox = process.env.SUPPORT_INBOX || 'customercare@cellular-expert.com';

  await transporter.sendMail({
    from: `"Cellular Expert Support Portal" <${process.env.EMAIL_USER}>`,
    to: helpdeskInbox,
    replyTo: email,
    subject: `Support Request — ${fullName} (${company || 'No company'})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color:#5b4feb;">New Support Request</h2>
        <table style="width:100%; border-collapse: collapse; font-size:13px;">
          <tr><td style="padding:6px 0; color:#888; width:120px;">Full name</td><td style="padding:6px 0;">${fullName}</td></tr>
          <tr><td style="padding:6px 0; color:#888;">Email</td><td style="padding:6px 0;">${email}</td></tr>
          <tr><td style="padding:6px 0; color:#888;">Company</td><td style="padding:6px 0;">${company || '—'}</td></tr>
          <tr><td style="padding:6px 0; color:#888;">Product</td><td style="padding:6px 0;">${product || '—'}</td></tr>
        </table>
        <p style="color:#888; font-size:12px; margin-top:16px; margin-bottom:4px;">Question / description:</p>
        <div style="background:#f5f4ff; padding:14px 16px; border-radius:10px; font-size:13px; white-space:pre-line;">${description}</div>
        ${attachments.length > 0 ? `<p style="color:#888; font-size:12px; margin-top:16px;">${attachments.length} screenshot(s) attached.</p>` : ''}
      </div>
    `,
    attachments: attachments.map((file, i) => ({
      filename: file.originalname || `screenshot-${i + 1}.png`,
      content: file.buffer,
      contentType: file.mimetype,
    })),
  });
}

module.exports = { sendWelcomeEmail, sendPasswordChangedEmail, sendVerificationCode, sendSupportRequest };