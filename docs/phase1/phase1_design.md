# Phase 1: 项目初始化与基础设施 - 详细设计文档

## 1. 概述 (Overview)
本阶段的目标是建立坚实的项目基础，确保前端框架、数据库连接、认证系统能够协同工作。这是后续所有功能开发的基石。

**核心交付物**：
*   一个运行在 Cloudflare Pages 上的 Next.js 应用骨架。
*   配置完毕的 Cloudflare 基础设施绑定 (D1, R2, Workers AI, Queues, KV)。
*   生产级别的 SQL 数据库 Schema。
*   基于 Auth.js 的身份验证系统 (GitHub OAuth)。

## 2. 涉及的 PRD 需求 (PRD Coverage)

| 需求ID | 需求描述 | 在本阶段的实现 |
| :--- | :--- | :--- |
| **NFR-01** | **性能**：首屏加载时间 < 1.0s，Edge 渲染 | 初始化 Next.js 并配置 `@opennextjs/cloudflare` 适配器或 `next-on-pages`，开启 ISR 支持。 |
| **NFR-03** | **成本控制**：使用 Cloudflare 免费额度 | 配置 `wrangler.toml` 以使用 D1、R2 免费层，不依赖外部付费数据库。 |
| **NFR-04** | **隐私与安全**：用户数据私有拥有 | 部署 D1 数据库，确保用户信息和订阅列表所有权在开发者手中。 |
| **2.4** | **用户系统**：GitHub/Google 登录 | 集成 Auth.js v5，实现 OAuth 登录并将会话持久化到 D1 `users` 表。 |

## 3. 架构设计 (Architecture Design)

### 3.1 技术栈选型
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn UI
*   **Database**: Cloudflare D1 (SQLite at the Edge)
*   **Auth**: Auth.js v5 (Beta) + D1 Adapter
*   **Object Storage**: Cloudflare R2 (用于后续存储内容快照)
*   **Deployment**: Cloudflare Pages

### 3.2 数据库模式设计 (Database Schema)

我们将使用 SQLite 语法设计核心表结构。

#### Users 表 (`users`)
用于存储 Auth.js 认证后的用户信息。
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified DATETIME,
  image TEXT
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

#### Sources 表 (`sources`)
存储用户的订阅源配置。
```sql
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL, -- 原始URL
  type TEXT CHECK(type IN ('youtube', 'jike', 'rss')) NOT NULL,
  name TEXT, -- 频道/用户名称
  avatar_url TEXT, -- 头像/图标
  last_fetched_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Feed Items 表 (`feed_items`)
存储每一条抓取到的内容元数据。注意内容本身不存这里。
```sql
CREATE TABLE feed_items (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL, -- 跳转原文链接
  published_at DATETIME,
  summary_r2_key TEXT, -- 指向 R2 中存储的 AI 摘要 JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);
```

### 3.3 目录结构规划
```
/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/route.ts  # Auth.js Handler
│   ├── (auth)/             # 认证相关页面组件
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                 # Shadcn UI 组件
├── lib/
│   ├── db/                 # Drizzle ORM 配置 (推荐用于类型安全)
│   └── auth.ts             # Auth 配置文件
├── migrations/             # D1 迁移文件 SQL
├── wrangler.toml           # Cloudflare 核心配置
└── package.json
```

## 4. UI/UX 设计要点 (针对本阶段)

### 4.1 登录页 (Sign In)
虽然目前只是基础设施，我们需要一个简单的登录入口来验证 Auth.js。
*   **设计风格**：极简中心卡片。
*   **元素**：Logo，"Sign in with GitHub" 黑色按钮。
*   **状态**：登录中 Loading 状态，登录失败错误提示。

### 4.2 仪表盘骨架 (Dashboard Skeleton)
登录后的 Landing 页面。
*   **元素**：显示当前登录用户的头像和名字（从 Session 获取）。
*   **验证**：证明 D1 Adapter 正常工作，即 Auth.js 能从 D1 读取用户数据。

## 5. 实施步骤细节

1.  **初始化项目**：
    执行 `npm create cloudflare@latest`，选择 Next.js 模板。
    
2.  **配置 Wrangler**：
    在 `wrangler.toml` 中添加 D1 `[[d1_databases]]` 和 R2 `[[r2_buckets]]` 的绑定配置。需先在 Cloudflare Dashboard 创建相应的数据库和存储桶。

3.  **安装 Shadcn UI**：
    运行 `npx shadcn-ui@latest init`，配置主题色为 Zinc (灰阶)。

4.  **数据库迁移**：
    将上述 SQL Schema 保存为 `migrations/0000_setup.sql`。
    使用 `npx wrangler d1 migrations execute <DB_NAME> --local` 进行本地测试。
    
5.  **配置 Auth.js**：
    创建 `auth.ts`，配置 GitHub Provider 和 D1 Adapter。
    设置环境变量 `AUTH_SECRET` 和 `AUTH_GITHUB_ID/SECRET`。

6.  **验证测试**：
    运行 `npm run dev` (Cloudflare 模拟环境)，尝试登录并检查本地 D1 sqlite 文件是否有数据写入。
