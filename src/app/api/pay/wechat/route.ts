import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

    if (session.user.plan === "pro") {
      return NextResponse.json({ error: "你已经是 Pro 会员了~ 👑" }, { status: 400 });
    }

    const orderId = generateOrderId();
    const appId = process.env.WECHAT_PAY_APP_ID;
    const mchId = process.env.WECHAT_PAY_MCH_ID;
    const apiKey = process.env.WECHAT_PAY_API_KEY;

    if (!appId || !mchId || !apiKey) {
      return NextResponse.json({
        orderId,
        testMode: true,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(`weixin://wxpay/bizpayurl?pr=TEST_${orderId}`)}`,
        message: "测试模式：3秒后自动确认支付",
      });
    }

    const nonceStr = crypto.randomBytes(16).toString("hex");
    const notifyUrl = `${process.env.NEXTAUTH_URL || "https://suno-fashion.com"}/api/pay/wechat/notify`;

    const params: Record<string, string> = {
      appid: appId,
      body: "Make Words Cute Pro",
      mch_id: mchId,
      nonce_str: nonceStr,
      notify_url: notifyUrl,
      out_trade_no: orderId,
      spbill_create_ip: "127.0.0.1",
      total_fee: "1990",
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
      return NextResponse.json({ error: "微信支付下单失败" }, { status: 502 });
    }

    return NextResponse.json({
      orderId,
      testMode: false,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(codeUrlMatch[1])}`,
    });
  } catch (error) {
    console.error("WeChat Pay error:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  return NextResponse.json({ status: "paid", plan: "pro" });
}
