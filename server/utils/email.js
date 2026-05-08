const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`\n📧 [DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Chai Heritage" <noreply@chaiheritage.co.ke>',
    to,
    subject,
    html,
  });
};

const sendVerificationEmail = async (user, code) => {
  if (!getTransporter()) {
    console.log(`\n📧 [DEV EMAIL] Verification code for ${user.email}: ${code}\n`);
    return;
  }
  await sendEmail({
    to: user.email,
    subject: 'Verify your Chai Heritage account',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px;background:#f5f0e8;border-radius:16px;">
        <h1 style="color:#1B4332;margin:0 0 4px;">🍵 Chai Heritage</h1>
        <h2 style="color:#3E2723;margin:0 0 16px;">Verify your email</h2>
        <p style="color:#5D4037;">Hi ${user.name}, welcome! Use the code below to verify your email address.</p>
        <div style="background:#fff;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
          <p style="color:#9E9E9E;font-size:13px;margin:0 0 8px;">Your verification code</p>
          <p style="font-size:42px;font-weight:bold;color:#1B4332;letter-spacing:10px;margin:0;">${code}</p>
          <p style="color:#9E9E9E;font-size:12px;margin:8px 0 0;">Expires in 15 minutes</p>
        </div>
        <p style="color:#9E9E9E;font-size:12px;">If you didn't create an account, ignore this email.</p>
      </div>`,
  });
};

const sendOrderConfirmation = async (user, order) => {
  if (!getTransporter()) {
    console.log(`\n📧 [DEV EMAIL] Order confirmation for ${user.email}: ${order.orderNumber}\n`);
    return;
  }
  const itemRows = order.items.map(i =>
    `<tr><td style="padding:8px 0;color:#5D4037;">${i.name} ×${i.quantity}</td><td style="padding:8px 0;text-align:right;font-weight:bold;">KES ${(i.price * i.quantity).toLocaleString()}</td></tr>`
  ).join('');
  await sendEmail({
    to: user.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px;background:#f5f0e8;border-radius:16px;">
        <h1 style="color:#1B4332;margin:0 0 4px;">🍵 Chai Heritage</h1>
        <h2 style="color:#3E2723;margin:0 0 16px;">Order Confirmed!</h2>
        <p style="color:#5D4037;">Hi ${user.name}, thank you for your order.</p>
        <div style="background:#fff;border-radius:12px;padding:24px;margin:20px 0;">
          <p style="margin:0 0 4px;"><strong>Order:</strong> ${order.orderNumber}</p>
          <p style="margin:0 0 16px;color:#9E9E9E;font-size:13px;">${new Date(order.createdAt).toLocaleDateString('en-KE',{dateStyle:'medium'})}</p>
          <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
          <hr style="border:1px solid #f5f0e8;margin:12px 0;"/>
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;">
            <span>Total</span><span style="color:#1B4332;">KES ${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        <p style="color:#9E9E9E;font-size:12px;">Thank you for choosing Chai Heritage!</p>
      </div>`,
  });
};

const sendAdminInvite = async (invitee, tempPassword, inviterName) => {
  if (!getTransporter()) {
    console.log(`\n📧 [DEV EMAIL] Admin invite for ${invitee.email} — temp password: ${tempPassword}\n`);
    return;
  }
  await sendEmail({
    to: invitee.email,
    subject: 'You have been invited to Chai Heritage Admin',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px;background:#f5f0e8;border-radius:16px;">
        <h1 style="color:#1B4332;margin:0 0 4px;">🍵 Chai Heritage</h1>
        <h2 style="color:#3E2723;margin:0 0 16px;">Admin Invitation</h2>
        <p style="color:#5D4037;">Hi ${invitee.name}, you've been invited by <strong>${inviterName}</strong> to manage the Chai Heritage admin panel.</p>
        <div style="background:#fff;border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:#9E9E9E;font-size:13px;margin:0 0 4px;">Your login credentials</p>
          <p style="margin:4px 0;"><strong>Email:</strong> ${invitee.email}</p>
          <p style="margin:4px 0;"><strong>Temporary Password:</strong> <code style="background:#f5f0e8;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
        </div>
        <p style="color:#5D4037;font-size:14px;">Please log in and change your password immediately from the Settings page.</p>
        <p style="color:#9E9E9E;font-size:12px;margin-top:16px;">If you were not expecting this, contact your administrator.</p>
      </div>`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendOrderConfirmation, sendAdminInvite };
