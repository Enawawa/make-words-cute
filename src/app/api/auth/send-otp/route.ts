import { NextRequest, NextResponse } from "next/server";
import { generateOtp, createOtpToken } from "@/lib/otp";
import nodemailer from "nodemailer";

async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || "Make Words Cute <noreply@suno-fashion.com>";

  if (!host || !user || !pass) {
    console.log(`\n📧 [DEV] OTP for ${email}: ${code}\n`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: `🎀 Make Words Cute 验证码: ${code}`,
    html: `
      <div style="max-width:400px;margin:0 auto;padding:32px;font-family:system-ui,sans-serif;background:linear-gradient(135deg,#fef7ff,#fdf2f8);border-radius:16px;">
        <h2 style="text-align:center;color:#ec4899;">🎀 Make Words Cute</h2>
        <p style="text-align:center;color:#6b7280;">你的登录验证码是:</p>
        <div style="text-align:center;font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;padding:16px;background:white;border-radius:12px;margin:16px 0;">${code}</div>
        <p style="text-align:center;color:#9ca3af;font-size:13px;">验证码 10 分钟内有效，请勿泄露给他人。</p>
      </div>`,
  });
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const code = generateOtp();
    const token = createOtpToken(email, code);

    await sendOtpEmail(email, code);

    return NextResponse.json({ ok: true, token });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 });
  }
}
