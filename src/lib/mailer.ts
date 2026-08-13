import nodemailer from 'nodemailer';

// ponytail: SMTP via nodemailer. Configure SMTP_HOST/PORT/USER/PASS/FROM in env.
// Falls back to logging the email to the server console when SMTP is not configured
// (keeps dev working without a mail server).
export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
      : undefined,
  });
  return transporter;
}

/** Send an email. Resolves true when actually sent; false when SMTP is unconfigured. */
export async function sendMail(msg: MailMessage): Promise<boolean> {
  const tr = getTransporter();
  if (!tr) {
    console.log('[mailer] SMTP not configured — email NOT sent. Would send to', msg.to, '::', msg.subject);
    return false;
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost';
  await tr.sendMail({ from, to: msg.to, subject: msg.subject, html: msg.html });
  return true;
}
