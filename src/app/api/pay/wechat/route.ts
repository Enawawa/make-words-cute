import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateOrderId() {
  return `MWC${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.plan === "pro") {
      return NextResponse.json({ error: "你已经是 Pro 会员了~ 👑" }, { status: 400 });
    }

    const orderId = generateOrderId();

    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: 1990,
        method: "wechat",
        status: "pending",
        orderId,
      },
    });

    const appId = process.env.WECHAT_PAY_APP_ID;
    const mchId = process.env.WECHAT_PAY_MCH_ID;
    const apiKey = process.env.WECHAT_PAY_API_KEY;

    if (!appId || !mchId || !apiKey) {
      /* ----- 测试模式：3秒后自动确认 ----- */
      setTimeout(async () => {
        try {
          await prisma.payment.update({ where: { orderId }, data: { status: "paid" } });
          await prisma.user.update({ where: { id: session.user.id }, data: { plan: "pro" } });
        } catch (e) {
          console.error("Test mode auto-confirm error:", e);
        }
      }, 3000);

      return NextResponse.json({
        orderId,
        testMode: true,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`weixin://wxpay/bizpayurl?pr=TEST_${orderId}`)}`,
        message: "测试模式：3秒后自动确认支付",
      });
    }

    /* ----- 正式模式：调用微信支付统一下单 API ----- */
    const nonceStr = crypto.randomBytes(16).toString("hex");
    const body = "Make Words Cute Pro 会员";
    const notifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/pay/wechat/notify`;
    const totalFee = "1990";

    const params: Record<string, string> = {
      appid: appId,
      body,
      mch_id: mchId,
      nonce_str: nonceStr,
      notify_url: notifyUrl,
      out_trade_no: orderId,
      spbill_create_ip: "127.0.0.1",
      total_fee: totalFee,
      trade_type: "NATIVE",
    };

    const signStr = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&") + `&key=${apiKey}`;
    const sign = crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
    params.sign = sign;

    const xml = `<xml>${Object.entries(params).map(([k, v]) => `<${k}>${v}</${k}>`).join("")}</xml>`;

    const res = await fetch("https://api.mch.weixin.qq.com/pay/unifiedorder", {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: xml,
    });

    const text = await res.text();
    const codeUrlMatch = text.match(/<code_url><!\[CDATA\[(.*?)\]\]><\/code_url>/);

    if (!codeUrlMatch) {
      console.error("WeChat Pay error:", text);
      return NextResponse.json({ error: "微信支付下单失败，请稍后重试" }, { status: 502 });
    }

    const codeUrl = codeUrlMatch[1];
    return NextResponse.json({
      orderId,
      testMode: false,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(codeUrl)}`,
    });
  } catch (error) {
    console.error("WeChat Pay error:", error);
    return NextResponse.json({ error: "创建支付订单失败" }, { status: 500 });
  }
}

/* 查询订单状态 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "缺少订单号" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

  return NextResponse.json({ status: payment.status, plan: payment.status === "paid" ? "pro" : "free" });
}
