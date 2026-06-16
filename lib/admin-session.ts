import crypto from "node:crypto";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function createAdminSession() {
  const expiry = Date.now() + DAY_IN_MS;
  const token = crypto.randomUUID();
  const payload = `${token}.${expiry}`;
  const signature = signPayload(payload);

  return {
    cookieValue: `${payload}.${signature}`,
    expiry,
  };
}

export function validateAdminSession(cookieValue: string | undefined | null) {
  if (!cookieValue) {
    return false;
  }

  const [token, expiryString, signature] = cookieValue.split(".");

  if (!token || !expiryString || !signature) {
    return false;
  }

  const payload = `${token}.${expiryString}`;
  const expected = signPayload(payload);

  if (signature.length !== expected.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return false;
  }

  const expiry = Number(expiryString);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    return false;
  }

  return true;
}

export function destroyAdminSession(_cookieValue: string | undefined | null) {
  return;
}
