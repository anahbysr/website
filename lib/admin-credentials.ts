import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const ADMIN_PASSWORD_HASH_KEY = "admin_password_hash";
const ADMIN_RECOVERY_EMAIL_KEY = "admin_recovery_email";
const ADMIN_RESET_TOKEN_HASH_KEY = "admin_reset_token_hash";
const ADMIN_RESET_TOKEN_EXPIRY_KEY = "admin_reset_token_expiry";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, existingHash] = storedHash.split(":");

  if (!salt || !existingHash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(existingHash, "hex"));
}

async function upsertSetting(key: string, value: string) {
  await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function ensureAdminCredentialsInitialized() {
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: [ADMIN_PASSWORD_HASH_KEY, ADMIN_RECOVERY_EMAIL_KEY],
      },
    },
  });
  const settingsMap = new Map(settings.map((setting) => [setting.key, setting.value]));

  if (!settingsMap.get(ADMIN_PASSWORD_HASH_KEY)) {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD is not configured");
    }

    await upsertSetting(ADMIN_PASSWORD_HASH_KEY, hashPassword(adminPassword));
  }

  if (!settingsMap.get(ADMIN_RECOVERY_EMAIL_KEY)) {
    const recoveryEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

    if (!recoveryEmail) {
      throw new Error("ADMIN_EMAIL or SMTP_USER must be configured");
    }

    await upsertSetting(ADMIN_RECOVERY_EMAIL_KEY, normalizeEmail(recoveryEmail));
  }
}

export async function verifyAdminPassword(password: string) {
  await ensureAdminCredentialsInitialized();

  const stored = await prisma.settings.findUnique({
    where: { key: ADMIN_PASSWORD_HASH_KEY },
  });

  if (!stored) {
    return false;
  }

  return verifyPassword(password, stored.value);
}

export async function getAdminRecoveryEmail() {
  await ensureAdminCredentialsInitialized();

  const stored = await prisma.settings.findUnique({
    where: { key: ADMIN_RECOVERY_EMAIL_KEY },
  });

  return stored?.value || null;
}

export async function sendAdminPasswordResetEmail(email: string) {
  await ensureAdminCredentialsInitialized();
  const recoveryEmail = await getAdminRecoveryEmail();

  if (!recoveryEmail || normalizeEmail(email) !== recoveryEmail) {
    return { sent: false as const };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/reset-password?token=${encodeURIComponent(token)}`;

  await Promise.all([
    upsertSetting(ADMIN_RESET_TOKEN_HASH_KEY, hashResetToken(token)),
    upsertSetting(ADMIN_RESET_TOKEN_EXPIRY_KEY, expiresAt),
  ]);

  await sendEmail({
    to: recoveryEmail,
    subject: "Anah admin password reset",
    html: `
      <div style="margin:0;padding:24px 0;background:#f6f0ea;font-family:Arial,Helvetica,sans-serif;color:#2f241f;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:620px;margin:0 auto;background:#fffdf9;border:1px solid #eadfd4;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 20px;background:linear-gradient(135deg,#f8ede2 0%,#f4d8c5 45%,#e7b8a1 100%);">
              <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7a4b38;">Admin Access</div>
              <h1 style="margin:14px 0 8px;font-size:30px;line-height:1.2;color:#2f241f;">Reset your admin password</h1>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#4f4038;">Use the secure link below to choose a new admin password for Anah.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px;">
              <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#4f4038;">This link is valid for 1 hour.</p>
              <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#7a4b38;color:#fffaf4;text-decoration:none;font-weight:700;">Reset Password</a>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#7d6d61;">If the button does not open, copy this URL into your browser:<br />${resetUrl}</p>
            </td>
          </tr>
        </table>
      </div>
    `,
  });

  return { sent: true as const };
}

export async function resetAdminPassword(token: string, nextPassword: string) {
  await ensureAdminCredentialsInitialized();

  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: [ADMIN_RESET_TOKEN_HASH_KEY, ADMIN_RESET_TOKEN_EXPIRY_KEY],
      },
    },
  });
  const settingsMap = new Map(settings.map((setting) => [setting.key, setting.value]));
  const storedHash = settingsMap.get(ADMIN_RESET_TOKEN_HASH_KEY);
  const expiry = settingsMap.get(ADMIN_RESET_TOKEN_EXPIRY_KEY);

  if (!storedHash || !expiry) {
    return { success: false as const, error: "Reset link is invalid or has expired." };
  }

  const expiresAt = new Date(expiry).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { success: false as const, error: "Reset link is invalid or has expired." };
  }

  if (hashResetToken(token) !== storedHash) {
    return { success: false as const, error: "Reset link is invalid or has expired." };
  }

  await Promise.all([
    upsertSetting(ADMIN_PASSWORD_HASH_KEY, hashPassword(nextPassword)),
    upsertSetting(ADMIN_RESET_TOKEN_HASH_KEY, ""),
    upsertSetting(ADMIN_RESET_TOKEN_EXPIRY_KEY, ""),
  ]);

  return { success: true as const };
}
