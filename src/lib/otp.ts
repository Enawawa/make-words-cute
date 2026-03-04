import crypto from "crypto";

const ALG = "aes-256-cbc";

function getKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return crypto.scryptSync(secret, "make-words-cute-salt", 32);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createOtpToken(email: string, code: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase().trim(),
    code,
    exp: Date.now() + 10 * 60_000,
  });
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALG, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return iv.toString("hex") + "." + encrypted.toString("hex");
}

export function verifyOtpToken(
  token: string,
  email: string,
  code: string
): boolean {
  try {
    const [ivHex, encHex] = token.split(".");
    if (!ivHex || !encHex) return false;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALG, getKey(), iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encHex, "hex")),
      decipher.final(),
    ]).toString("utf8");
    const data = JSON.parse(decrypted);
    return (
      data.email === email.toLowerCase().trim() &&
      data.code === code &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}
