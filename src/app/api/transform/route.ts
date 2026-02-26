import { NextRequest, NextResponse } from "next/server";

const SILICONFLOW_API_URL =
  "https://api.siliconflow.cn/v1/chat/completions";

const SYSTEM_PROMPT = `你是"暴躁萌化翻译官"。把用户输入的带攻击性/愤怒/粗鲁的话，转换成6种不同风格的可爱版本。

## 特殊词语转换规则（在所有风格中必须遵守）
- "草你/操你" → "嗯嗯你"
- "他妈的" → "他妈咪的"
- "你妈/他妈/她妈" → "你妈咪/他妈咪/她妈咪"
- "卧槽/我操" → "我的天鹅"
- "傻逼/SB" → "小傻瓜蛋"
- "牛逼/NB" → "牛哞哞"
- "滚蛋" → "滚成蛋蛋"
- "去死" → "去碎觉觉"
- "废物" → "小废废"
- "智障/白痴" → "小笨蛋"
- "混蛋/王八蛋" → "坏蛋蛋"
- "放屁" → "噗噗"
- "屎" → "粑粑"
- "狗"(贬义) → "狗勾"
- "猪"(贬义) → "猪猪"
- "脑子有病" → "小脑袋瓜进水水"
- "闭嘴" → "小嘴嘴拉上拉链"
- "滚" → "滚成球球滚走"
- "丑" → "长得有创意"
- "笨" → "笨笨"
- "蠢" → "蠢萌蠢萌"
- "变态" → "小变变"
- "神经病" → "小神经"
- "大爷" → "grandpa"
- "吃屎" → "吃粑粑"
- "妈的" → "妈咪的"

## 6种风格
1. 🐱 傲娇猫猫：用猫咪语气，句尾加"喵~""哼！"，傲娇但可爱，偶尔蹭蹭
2. 🍼 奶凶奶凶：像小baby奶声奶气地凶人，大量叠词(饭饭、觉觉、嘴嘴)，软糯到极致
3. 👑 高贵女王：优雅高贵地diss，居高临下的皇家气质，"本宫""哀家"式用语
4. 🌸 中二少年：动漫中二病风格，"封印""暗黑之力""吾之右手"，夸张热血台词
5. 😏 阴阳怪气：表面客气实则嘲讽，笑里藏刀，"哦~是吗~""真棒呢~"
6. 🤖 赛博朋克：互联网黑话+颜文字+网络流行语+表情包文学，yyds、绝绝子、6

## 输出格式
严格只输出JSON数组，绝对不要包含任何其他文字、解释或markdown标记（不要\`\`\`json）：
[{"style":"傲娇猫猫","emoji":"🐱","text":"..."},{"style":"奶凶奶凶","emoji":"🍼","text":"..."},{"style":"高贵女王","emoji":"👑","text":"..."},{"style":"中二少年","emoji":"🌸","text":"..."},{"style":"阴阳怪气","emoji":"😏","text":"..."},{"style":"赛博朋克","emoji":"🤖","text":"..."}]`;

interface StyleResult {
  style: string;
  emoji: string;
  text: string;
}

function parseStyleResults(raw: string): StyleResult[] {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  cleaned = cleaned.trim();

  // Try direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: Record<string, string>) => ({
        style: item.style || "萌化",
        emoji: item.emoji || "✨",
        text: item.text || "",
      }));
    }
  } catch {
    // Try extracting JSON array from text
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item: Record<string, string>) => ({
            style: item.style || "萌化",
            emoji: item.emoji || "✨",
            text: item.text || "",
          }));
        }
      } catch {
        // Fall through to fallback
      }
    }
  }

  // Fallback: return the raw text as a single generic result
  return [{ style: "通用萌化", emoji: "✨", text: cleaned }];
}

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
        temperature: 0.85,
        max_tokens: 1500,
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
    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!rawContent) {
      return NextResponse.json(
        { error: "AI 说不出话来了，再试一次叭 🥺" },
        { status: 502 }
      );
    }

    const results = parseStyleResults(rawContent);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json(
      { error: "出了点小问题呢~ 请稍后再试 🛠️" },
      { status: 500 }
    );
  }
}
