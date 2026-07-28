import nodemailer from "nodemailer";

export async function sendContactEmail(details: {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  ip: string;
}): Promise<boolean> {
  const { name, email, subject, message, timestamp, ip } = details;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.mail.yahoo.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const isSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailText = `New Contact Form Submission:
--------------------------------------------
Submitted On: ${new Date(timestamp).toLocaleString()}
Sender IP Address: ${ip}

Full Name: ${name}
Email Address: ${email}
Subject: ${subject}

Message Details:
--------------------------------------------
${message}
`;

    const emailHtml = `
<div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
  <div style="background-color: #4f46e5; color: #ffffff; padding: 24px; text-align: center;">
    <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Contact Submission</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff;">Received from ConvertOneAI Contact Form</p>
  </div>
  <div style="padding: 24px; background-color: #ffffff;">
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px; border-bottom: 1px solid #f1f5f9;">Submitted On</td>
        <td style="padding: 8px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${new Date(timestamp).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">IP Address</td>
        <td style="padding: 8px 0; color: #0f172a; font-family: monospace; font-size: 13px; border-bottom: 1px solid #f1f5f9;">${ip}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Full Name</td>
        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Email Address</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Subject</td>
        <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${subject}</td>
      </tr>
    </table>
    
    <div style="margin-top: 24px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #64748b; uppercase; letter-spacing: 0.05em;">Message Body</h3>
      <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; border-radius: 0 8px 8px 0; font-style: italic; white-space: pre-wrap; font-size: 14px; color: #334155;">${message}</div>
    </div>
  </div>
  <div style="background-color: #f1f5f9; color: #64748b; padding: 16px; text-align: center; font-size: 12px; border-top: 1px solid #e2e8f0;">
    This is an automated transmission from the <strong>ConvertOneAI Contact Engine</strong>.
  </div>
</div>
`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: process.env.EMAIL_TO,
      subject: `[Contact Support] ${subject}`,
      text: emailText,
      html: emailHtml,
    });

    console.log(`[Email Success] Email successfully sent to boutarradafathallah@yahoo.com for subject: ${subject}`);
    return true;
  } else {
    console.warn(`[SMTP Warn] SMTP_USER or SMTP_PASS not specified. Message simulation activated. Here are the submission details:`);
    console.log(`-- Simulated Contact Delivery --`);
    console.log(`To: ${process.env.EMAIL_TO}`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Date: ${timestamp} | IP: ${ip}`);
    console.log(`Message: ${message}`);
    console.log(`---------------------------------`);
    return false;
  }
}
