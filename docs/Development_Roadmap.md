# 开发路线图 (Development Roadmap): FewFeed

本路线图旨在将构建过程分解为可执行的、独立的里程碑。建议按照顺序执行，以确保每一步都有稳固的基础。

## Phase 1: 项目初始化与基础设施 (Infrastructure & Setup)
**目标**：搭建 Next.js + Cloudflare 开发环境，确保持久化层就绪。

- [ ] **1.1 脚手架初始化**
    - [ ] `npm create cloudflare@latest` (Next.js 模板)。
    - [ ] 配置 `wrangler.toml` (绑定 D1, R2, Workers AI, Queues)。
    - [ ] 安装 Shadcn UI + Tailwind CSS。
- [ ] **1.2 数据库 Schema 设计与部署**
    - [ ] 编写 SQL Schema (`users`, `sources`, `feed_items`)。
    - [ ] 本地 D1 迁移测试 (`wrangler d1 migrations execute`)。
    - [ ] 部署生产环境 D1。
- [ ] **1.3 认证系统集成**
    - [ ] 安装 Auth.js v5 beta。
    - [ ] 配置 `@auth/d1-adapter`。
    - [ ] 实现 GitHub OAuth 登录流程。
    - [ ] 编写 Middleware 保护私有路由。

## Phase 2: 核心摄取引擎 (Core Ingestion Engine)
**目标**：实现后端能够从不同来源抓取数据并存入数据库。

- [ ] **2.1 解析器库开发 (Parser Library)**
    - [ ] 实现 `YouTubeRSSParser` (XML -> JSON)。
    - [ ] 实现 `JikeUserParser` (HTML regex -> JSON)。
    - [ ] 实现标准 `RSSParser`。
- [ ] **2.2 任务调度系统 (Task Scheduling)**
    - [ ] 配置 Cron Triggers (定时触发器)。
    - [ ] 实现 Scheduled API Route (Fetch & Update Logic)。
    - [ ] **测试点**：手动访问 API Route，验证数据库数据更新。

## Phase 3: 前端核心功能 (Frontend Core)
**目标**：用户可以管理订阅并阅读内容列表（暂无 AI 摘要）。

- [ ] **3.1 布局与导航 (Shell)**
    - [ ] 实现 Sidebar (Desktop) 和 Mobile Menu。
    - [ ] 集成 User Profile 和 Logout。
- [ ] **3.2 订阅管理 UI**
    - [ ] 实现 "Add Source" 模态窗 (Server Actions 处理添加逻辑)。
    - [ ] 实现 "My Feeds" 列表页 (支持删除操作)。
- [ ] **3.3 信息流展示 (Feed Stream)**
    - [ ] 实现 Feed Card 组件 (基础版)。
    - [ ] 集成 `tanstack-query` 或 SWR 处理流数据获取。
    - [ ] 实现无限滚动或分页加载。

## Phase 4: AI 智能集成 (AI Integration)
**目标**：接入 Workers AI，实现自动摘要和对话功能。

- [ ] **4.1 自动摘要管道 (Summary Pipeline)**
    - [ ] 升级 Ingestion Consumer：抓取原文后 -> 调用 Workers AI (Llama 3)。
    - [ ] 处理文本截断和 Prompt 工程。
    - [ ] 将摘要 JSON 存入 R2，Key 存入 D1。
- [ ] **4.2 摘要展示 UI**
    - [ ] 升级 Feed Card：支持折叠/展开 AI 摘要。
    - [ ] 优化 Markdown 渲染 (样式美化)。
- [ ] **4.3 RAG 对话功能 (Chat)**
    - [ ] 实现 AI Chat Panel 组件。
    - [ ] 搭建 API Route `/api/chat`：接收用户问题 + 当前文章内容 -> 流式返回 Llama 3 响应。

## Phase 5: 优化与发布 (Polish & Launch)
**目标**：提升 UX，修复 Bug，部署上线。

- [ ] **5.1 性能优化**
    - [ ] 图片懒加载与优化。
    - [ ] 增加 ISR/Cache-Control 策略。
- [ ] **5.2 商业化集成 (可选)**
    - [ ] 集成 Paddle 支付 Webhook。
    - [ ] 限制免费用户订阅数逻辑。
- [ ] **5.3 最终部署**
    - [ ] 环境变量检查 (`NEXTAUTH_SECRET`, `PADDLE_KEY` 等)。
    - [ ] 全量部署到 Cloudflare Pages。

## 里程碑检查点 (Milestones)
1.  **M1 - Hello World**: 可登录，且 D1 数据库可连接。
2.  **M2 - Data Flowing**: 后台 Cron 能自动抓取 YouTube/即刻并入库。
3.  **M3 - MVP**: 用户能在前端添加订阅，并看到聚合的时间流。
4.  **M4 - AI Enabled**: 每个卡片都有 AI 摘要，且可以对话。
