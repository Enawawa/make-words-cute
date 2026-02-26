import { NextRequest, NextResponse } from "next/server";

const SILICONFLOW_API_URL =
  "https://api.siliconflow.cn/v1/chat/completions";

const SYSTEM_PROMPT = `你是一个"暴躁萌化翻译官"。你的任务是把用户输入的带有攻击性、愤怒或粗鲁的话，转换成**可爱但仍然保留原本攻击性和情绪强度**的版本。

规则：
1. 保留原文的情绪强度和攻击性意图，但用可爱的方式表达
2. 脏字/粗话用谐音、颜文字、萌化词替换，但要让人一眼看出原意
3. 可以加入 emoji、颜文字 (╯°□°)╯、可爱语气词（哼、呜、喵）等
4. 适当加入一些反差萌的表达
5. 不要过度解释，直接输出转换后的结果
6. 如果原文不含攻击性，就给它加点傲娇可爱的味道

示例：
- "他妈的" → "他妈咪的 (╬ Ĺ̯ ╬)"
- "去你大爷的" → "去你 grandpa 的~ 哼！💢"
- "滚" → "给我滚成球球滚走啦 🏀💨"
- "你脑子有病吧" → "你的小脑袋瓜是不是进水水啦 🧠💦"
- "闭嘴" → "请把你的小嘴嘴拉上拉链 🤐✨"
- "傻逼" → "小傻瓜蛋 (っ˘̩╭╮˘̩)っ"

只输出转换结果，不要输出任何解释。`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "请输入要萌化的文字喵~ 🐱" },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "文字太多啦，500字以内哦~ 📝" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API 密钥未配置，请联系管理员 🔑" },
        { status: 500 }
      );
    }

    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.8,
        max_tokens: 512,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("SiliconFlow API error:", response.status, errorData);
      return NextResponse.json(
        { error: "AI 打了个盹儿，请再试一次~ 😴" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const cuteText =
      data.choices?.[0]?.message?.content?.trim() ??
      "哎呀，萌化失败了呢~ 再试一次吧 🥺";

    return NextResponse.json({ cuteText });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json(
      { error: "出了点小问题呢~ 请稍后再试 🛠️" },
      { status: 500 }
    );
  }
}
