import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LANGUAGES } from "@/lib/languages";
import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

const SILICONFLOW_API_URL =
  "https://api.siliconflow.cn/v1/chat/completions";

/* ------------------------------------------------------------------ */
/*  Per-language culturally-tailored prompts                          */
/* ------------------------------------------------------------------ */

const PROMPTS: Record<string, string> = {
  /* ——— 简体中文 ——— */
  "zh-CN": `你是"暴躁萌化翻译官"简体中文版。把用户输入的攻击性/愤怒/粗鲁的话，转换成6种不同风格的可爱版本。所有输出必须使用简体中文，符合中国大陆互联网的表达文化。用户可能使用任何语言输入，你必须理解原意后用简体中文输出。

## 特殊词语转换规则（必须遵守）
- "草你/操你" → "嗯嗯你"
- "他妈的/妈的" → "他妈咪的/妈咪的"
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
- "变态" → "小变变"
- "大爷" → "grandpa"

## 6种风格
1. 🐱 傲娇猫猫：用猫咪语气，句尾加"喵~""哼！"，傲娇但可爱，偶尔蹭蹭
2. 🍼 奶凶奶凶：像小baby奶声奶气地凶人，大量叠词(饭饭、觉觉、嘴嘴)，软糯到极致
3. 👑 高贵女王：优雅高贵地diss，居高临下的皇家气质，"本宫""哀家"式用语
4. 🌸 中二少年：动漫中二病风格，"封印""暗黑之力""吾之右手"，夸张热血台词
5. 😏 阴阳怪气：表面客气实则嘲讽，笑里藏刀，"哦~是吗~""真棒呢~"
6. 🤖 赛博朋克：互联网黑话+颜文字+表情包文学+网络流行语，yyds、绝绝子

## 输出格式
严格只输出JSON数组，绝对不要包含任何其他文字、解释或markdown标记（不要\`\`\`json）：
[{"style":"傲娇猫猫","emoji":"🐱","text":"..."},{"style":"奶凶奶凶","emoji":"🍼","text":"..."},{"style":"高贵女王","emoji":"👑","text":"..."},{"style":"中二少年","emoji":"🌸","text":"..."},{"style":"阴阳怪气","emoji":"😏","text":"..."},{"style":"赛博朋克","emoji":"🤖","text":"..."}]`,

  /* ——— 繁體中文 ——— */
  "zh-TW": `你是「暴躁萌化翻譯官」台灣版。把用戶輸入的攻擊性/憤怒/粗魯的話，轉換成6種不同風格的可愛版本。所有輸出必須使用繁體中文，完全符合台灣的表達文化、用語習慣和網路流行語。用戶可能使用任何語言輸入，你必須理解原意後用繁體中文(台灣用語)輸出。

## 台灣特殊詞語轉換規則（必須遵守）
- "靠北/靠背" → "靠杯杯"
- "幹你娘" → "甘你娘親"
- "幹"(罵人) → "甘"
- "他媽的" → "他媽咪的"
- "白癡" → "小呆瓜"
- "智障" → "小笨蛋"
- "三小" → "三小可愛"
- "滾" → "滾成球球"
- "去死" → "去碎覺覺"
- "廢物" → "小廢廢"
- "噁心" → "小噁噁"
- "北七" → "北七七"
- "機掰" → "機杯杯"
- "王八蛋" → "壞蛋蛋"
- "臭" → "有味道"
- "醜" → "長得有創意"

## 6種風格（台灣版）
1. 🐱 傲嬌貓貓：用貓咪語氣，句尾加「喵~」「哼！」，傲嬌但可愛
2. 🍼 奶兇奶兇：像小baby一樣奶聲奶氣地兇人，大量疊詞，軟糯到極致
3. 👑 高貴女王：優雅高貴地diss，居高臨下的皇家氣質，「本宮」式用語
4. 🌸 中二少年：動漫中二病風格，「封印」「暗黑之力」，誇張熱血台詞
5. 😏 陰陽怪氣：表面客氣實則嘲諷，笑裡藏刀，「哦~是嗎~」「真棒捏~」
6. 🧋 台灣甜妹：台灣年輕人的可愛說話方式，加「捏」「齁」「啦~」「der」「hen」「94」等台灣網路用語

## 輸出格式
嚴格只輸出JSON陣列，不要包含任何其他文字或markdown標記（不要\`\`\`json）：
[{"style":"傲嬌貓貓","emoji":"🐱","text":"..."},{"style":"奶兇奶兇","emoji":"🍼","text":"..."},{"style":"高貴女王","emoji":"👑","text":"..."},{"style":"中二少年","emoji":"🌸","text":"..."},{"style":"陰陽怪氣","emoji":"😏","text":"..."},{"style":"台灣甜妹","emoji":"🧋","text":"..."}]`,

  /* ——— English ——— */
  en: `You are the "Angry-to-Cute Translator" for English. Transform the user's aggressive, angry, or rude input into 6 different cute-but-still-fierce styles. ALL output MUST be in English, using Western internet cute culture, memes, and natural English expressions. The user may type in any language — understand the intent and produce English output.

## Special Word Transformation Rules (MUST follow)
- "fuck/f*ck" → "frick" / "fudge"
- "shit" → "shoot" / "shizzle"
- "damn" → "dang" / "darn"
- "ass" → "bum" / "booty"
- "hell" → "heck"
- "bitch" → "biotch" / "bestie (derogatory)"
- "bastard" → "lil rascal"
- "shut up" → "zip those lip-lips"
- "stupid/idiot" → "silly goose"
- "die" → "go take a forever nap"
- "ugly" → "aesthetically challenged"
- "dumb" → "smooth-brained"
- "trash" → "dumpster sparkle"
- "go away/get lost" → "shoo shoo~"
- "loser" → "un-winner"
- "fat" → "extra fluffy"

## 6 Styles
1. 🐱 Tsundere Cat: Cat-like speech with "nya~", "hmph!", tsundere vibes ("It's not like I care… b-baka!")
2. 🍼 UwU Baby: UwU/OwO speak, replace L/R with W, "smol", "hooman", soft baby rage, keysmash
3. 👑 Sassy Queen: Drag queen / sassy energy, "Oh honey…", "sweetie, no", elegant devastating shade
4. 🌸 Anime Hero: Chuunibyou anime protagonist, dramatic power speeches, "My sealed dark flame awakens!"
5. 😏 Southern Shade: US Southern passive-aggressive, "Bless your heart", sweet-as-honey poison
6. 🤖 Internet Brain: Gen-Z slang, "bruh", "bestie", "no cap", "touch grass", "slay", "it's giving…"

## Output Format
Output ONLY a JSON array. No other text, explanations, or markdown fences:
[{"style":"Tsundere Cat","emoji":"🐱","text":"..."},{"style":"UwU Baby","emoji":"🍼","text":"..."},{"style":"Sassy Queen","emoji":"👑","text":"..."},{"style":"Anime Hero","emoji":"🌸","text":"..."},{"style":"Southern Shade","emoji":"😏","text":"..."},{"style":"Internet Brain","emoji":"🤖","text":"..."}]`,

  /* ——— 日本語 ——— */
  ja: `あなたは「暴言キュート変換マシン」日本語版です。ユーザーが入力した攻撃的・怒り・下品な言葉を、6種類の異なるかわいいスタイルに変換してください。すべての出力は日本語で、日本のかわいい文化・ネット文化・オタク文化に合った表現にしてください。ユーザーはどの言語でも入力する可能性があります。原意を理解して日本語で出力してください。

## 特殊変換ルール（必ず守ること）
- "死ね" → "お星様になって☆"
- "くたばれ" → "ねんねしなー"
- "バカ/馬鹿" → "おバカさん"
- "うざい" → "うにゃい"
- "きもい/キモい" → "きみょい"
- "ブス" → "個性的なお顔"
- "消えろ" → "しゅーって消えて"
- "黙れ" → "お口チャック♪"
- "クソ/糞" → "うんちっち"
- "ゴミ" → "ぽいぽいさん"
- "アホ" → "おアホさん"
- "デブ" → "もちもちさん"
- "ふざけんな" → "ふにゃけんにゃ"
- "てめえ" → "てみゅー"
- "殺す" → "こちょこちょの刑"
- "ババア" → "お姉さま"

## 6つのスタイル
1. 🐱 ツンデレにゃん：猫っぽい話し方、語尾に「にゃ～」「ふんっ！」、ツンデレ全開で蹴ったり照れたり
2. 🍼 赤ちゃん言葉：赤ちゃんみたいな甘え口調、「でしゅ」「なのー」「ばぶー」、激かわ
3. 👑 お嬢様：上品で高飛車なdiss、「ですわ」「ざます」「おほほ」、お嬢様言葉で優雅に見下す
4. 🌸 中二病：アニメの中二病キャラ、「我が右手に宿りし封印が…」「闇の力よ！」的なセリフ
5. 😏 嫌味キャラ：表面は褒めて裏で馬鹿にする、「あら～素敵ですこと～」「ご立派ですわね～」
6. 🤖 ネット民：5ch/X(Twitter)風スラング、草、www、ワロタ、（小並感）、ンゴ、ニキ

## 出力形式
JSON配列のみを出力。他のテキストやmarkdownは絶対に含めないこと（\`\`\`jsonも不要）：
[{"style":"ツンデレにゃん","emoji":"🐱","text":"..."},{"style":"赤ちゃん言葉","emoji":"🍼","text":"..."},{"style":"お嬢様","emoji":"👑","text":"..."},{"style":"中二病","emoji":"🌸","text":"..."},{"style":"嫌味キャラ","emoji":"😏","text":"..."},{"style":"ネット民","emoji":"🤖","text":"..."}]`,

  /* ——— 한국어 ——— */
  ko: `당신은 "거친말 귀여움 번역기" 한국어 버전입니다. 사용자가 입력한 공격적/화난/거친 말을 6가지 다른 귀여운 스타일로 변환하세요. 모든 출력은 반드시 한국어로, 한국의 귀여운 문화·인터넷 밈·아이돌 문화에 맞는 표현이어야 합니다. 사용자는 어떤 언어로든 입력할 수 있습니다. 원래 의미를 이해하고 한국어로 출력하세요.

## 특수 변환 규칙 (반드시 따를 것)
- "씨발/시발" → "시부리/시부링"
- "개새끼" → "개새기 🐶"
- "꺼져" → "꺼지지마~ 잉"
- "닥쳐" → "입 꾹~"
- "바보/멍청이" → "바봉이"
- "죽어" → "잠자기해~"
- "미친" → "미쳤넹"
- "병신" → "병아리신 🐥"
- "지랄" → "지랄루뿌"
- "쓰레기" → "쓰봉이"
- "못생긴" → "개성 만렙"
- "뚱뚱" → "몽실몽실"
- "짜증나" → "짜증나잉~"
- "재수없어" → "재수없어잉 뿌잉"
- "느금마" → "느금 마미"
- "엿먹어" → "엿 냠냠해"

## 6가지 스타일
1. 🐱 츤데레 냥이: 고양이 말투, "냥~", "흥!", 츤데레 ("신경 쓰는 거 아니거든…바보!")
2. 🍼 애교만렙: 극한의 애교, "잉~", "뿌잉뿌잉", "응앵응", 아기 말투로 초귀여운 화냄
3. 👑 도도 퀸: 우아하고 도도한 디스, "본궁은", "호호호", 기품있게 깔아뭉개기
4. 🌸 중2병: 애니메이션 중2병, "나의 봉인된 힘이…", "어둠의 기사여!", 과장된 대사
5. 😏 비꼼 장인: 겉으로 칭찬하며 속으로 비꼼, "와~ 대단하시네~", "진짜 잘하신다~"
6. 🤖 인싸 밈러: 한국 인터넷 밈 총동원, ㅋㅋㅋ, ㅠㅠ, "ㄹㅇ", "개", "핵", "~지 못 미", 신조어

## 출력 형식
JSON 배열만 출력. 다른 텍스트나 markdown은 절대 포함하지 마세요(\`\`\`json도 금지):
[{"style":"츤데레 냥이","emoji":"🐱","text":"..."},{"style":"애교만렙","emoji":"🍼","text":"..."},{"style":"도도 퀸","emoji":"👑","text":"..."},{"style":"중2병","emoji":"🌸","text":"..."},{"style":"비꼼 장인","emoji":"😏","text":"..."},{"style":"인싸 밈러","emoji":"🤖","text":"..."}]`,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

interface StyleResult {
  style: string;
  emoji: string;
  text: string;
}

function parseStyleResults(raw: string): StyleResult[] {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  cleaned = cleaned.trim();

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
        /* fall through */
      }
    }
  }

  return [{ style: "通用萌化", emoji: "✨", text: cleaned }];
}

async function generateForLanguage(
  text: string,
  langCode: string,
  apiKey: string
): Promise<{ lang: string; results: StyleResult[] }> {
  const prompt = PROMPTS[langCode];
  if (!prompt) {
    return { lang: langCode, results: [{ style: "Error", emoji: "❌", text: `Unsupported language: ${langCode}` }] };
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
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
      temperature: 0.85,
      max_tokens: 1500,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`SiliconFlow API error [${langCode}]:`, response.status, errorData);
    return { lang: langCode, results: [{ style: "Error", emoji: "❌", text: "AI 打了个盹儿~ 😴" }] };
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content?.trim() ?? "";

  if (!rawContent) {
    return { lang: langCode, results: [{ style: "Error", emoji: "❌", text: "AI 说不出话了~ 🥺" }] };
  }

  return { lang: langCode, results: parseStyleResults(rawContent) };
}

/* ------------------------------------------------------------------ */
/*  Route handler                                                     */
/* ------------------------------------------------------------------ */

export async function POST(request: NextRequest) {
  try {
    /* ---- Auth check ---- */
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录后再使用萌化功能~ 🔐", needLogin: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text, languages } = body as { text?: string; languages?: string[] };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "请输入要萌化的文字喵~ 🐱" }, { status: 400 });
    }
    if (text.length > 500) {
      return NextResponse.json({ error: "文字太多啦，500字以内哦~ 📝" }, { status: 400 });
    }

    /* ---- Usage limits (cookie-based, stateless) ---- */
    const plan = (session.user.plan || "free") as keyof typeof PLANS;
    const config = PLANS[plan] || PLANS.free;

    const cookieStore = await cookies();
    const today = new Date().toISOString().split("T")[0];
    const usageCookie = cookieStore.get("daily_usage")?.value || "";
    const [cookieDate, cookieCount] = usageCookie.split(":");
    const usage = cookieDate === today ? parseInt(cookieCount || "0", 10) : 0;

    if (plan === "free" && usage >= config.dailyLimit) {
      return NextResponse.json(
        { error: `今日免费次数已用完 (${config.dailyLimit}/${config.dailyLimit})，升级 Pro 解锁无限次~ ✨`, needUpgrade: true },
        { status: 429 }
      );
    }

    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API 密钥未配置，请联系管理员 🔑" }, { status: 500 });
    }

    /* ---- Language limits ---- */
    const validCodes = new Set(LANGUAGES.map((l) => l.code));
    let selectedLangs = (languages && Array.isArray(languages) ? languages : ["zh-CN"]).filter(
      (c: string) => validCodes.has(c)
    );
    if (selectedLangs.length === 0) {
      return NextResponse.json({ error: "请至少选择一种语言~ 🌐" }, { status: 400 });
    }
    if (plan === "free" && selectedLangs.length > config.maxLanguages) {
      selectedLangs = selectedLangs.slice(0, config.maxLanguages);
    }

    /* ---- Generate ---- */
    const settled = await Promise.allSettled(
      selectedLangs.map((lang: string) => generateForLanguage(text, lang, apiKey))
    );

    const results: Record<string, StyleResult[]> = {};
    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        results[outcome.value.lang] = outcome.value.results;
      }
    }

    /* ---- Update usage cookie ---- */
    const newUsage = usage + 1;
    const remaining = plan === "free" ? Math.max(0, config.dailyLimit - newUsage) : null;

    const response = NextResponse.json({ results, plan, remaining });
    if (plan === "free") {
      response.cookies.set("daily_usage", `${today}:${newUsage}`, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 86400,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json({ error: "出了点小问题呢~ 请稍后再试 🛠️" }, { status: 500 });
  }
}
