# Make Words Cute 🎀

> 把你的暴躁话话变成又凶又萌的样子 ✨

一个基于 AI 的文字萌化工具。输入攻击性的话，AI 会把它变成可爱但不失锋芒的表达。

**示例：**
- "他妈的" → "他妈咪的 (╬ Ĺ̯ ╬)"
- "去你大爷的" → "去你 grandpa 的~ 哼！💢"
- "你脑子有病吧" → "你的小脑袋瓜是不是进水水啦 🧠💦"

## 技术栈

- **前端**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **AI**: 硅基流动 (SiliconFlow) API — Qwen2.5-7B-Instruct
- **部署**: Vercel

## 本地开发

### 前置条件

- Node.js 18+
- 硅基流动 API Key（[获取地址](https://cloud.siliconflow.cn/)）

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填入你的 SILICONFLOW_API_KEY
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

### 其他命令

```bash
npm run lint    # ESLint 检查
npm run build   # 构建生产版本
npm run start   # 启动生产服务器
```

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量 `SILICONFLOW_API_KEY`
4. 绑定自定义域名 `suno-fashion.com`

## License

MIT
