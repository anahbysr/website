import nodemailer from "nodemailer";

function parseSmtpPort() {
  const rawPort = process.env.SMTP_PORT || "587";
  const port = Number.parseInt(rawPort, 10);

  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number");
  }

  return port;
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured");
  }

  const port = parseSmtpPort();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({
  attachments,
  html,
  subject,
  to,
}: {
  attachments?: Array<{
    content: Buffer;
    contentType?: string;
    filename: string;
  }>;
  html: string;
  subject: string;
  to: string;
}) {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error("EMAIL_FROM must be configured");
  }

  const transporter = createTransport();
  await transporter.sendMail({
    attachments,
    from,
    to,
    subject,
    html,
  });
}
