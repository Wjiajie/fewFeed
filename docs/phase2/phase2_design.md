# Phase 2: 核心摄取引擎 - 详细设计文档 (Free Tier 版)

## 1. 概述 (Overview)
由于 Cloudflare 免费套餐不支持 Queues，我们将架构调整为基于 **Cron Triggers (定时触发器)** 的直接处理模式。
本阶段的目标是实现后端定时从订阅源抓取最新内容，解析数据，并存入数据库。

**核心交付物**：
*   **RSS/Atom 解析器**：用于处理标准订阅源。
*   **YouTube 解析器**：解析 YouTube XML Feed。
*   **Jike 解析器**：解析即刻用户主页（如果可行）。
*   **Scheduled Worker**：定时任务，负责轮询订阅源并更新数据。

## 2. 架构调整 (Architecture Changes)

### 原设计 (With Queues)
Dispatcher (Cron) -> Queue -> Consumer Worker (Processing)

### 新设计 (Cron Only - Free Tier)
Single Worker (Cron) -> Fetch Source -> Parse -> Save to DB

**限制与应对**：
*   **CPU 时间限制 (10ms)**：Cloudflare Workers 免费版 CPU 时间很少，但 I/O 等待时间不计入。解析复杂的 XML 可能耗费 CPU。
    *   *应对*：尽量使用流式解析或简单的 Regex/String 操作，避免重型 DOM 解析库。
*   **执行时长限制**：30秒（Wall time）。
    *   *应对*：每次 Cron 只处理一小批订阅源（例如每次随机选 5 个，或者按上次更新时间排序），避免一次性处理过多导致超时。

## 3. 详细设计 (Detailed Design)

### 3.1 解析器库 (`lib/parsers`)
定义统一的接口 `Parser`，所有源适配器都实现此接口。

```typescript
interface FeedItem {
  title: string;
  url: string;
  publishedAt: Date;
  content?: string; // 可选，通过 AI 摘要之前可能存原始内容
  guid?: string; // 用于去重
}

interface Parser {
  parse(content: string): Promise<FeedItem[]>;
}
```

*   `RSSParser`: 使用 `fast-xml-parser` (轻量级) 或手动正则解析标准 RSS。
*   `YouTubeParser`: YouTube 频道本质上也是 RSS XML，可以复用 XML 解析逻辑，针对性提取 `<entry>`。

### 3.2 数据库操作 (`lib/db/feed.ts`)
*   `getSourcesToFetch(limit: number)`:即使获取 `last_fetched_at` 最早的 N 个源。
*   `uidFeedItems(sourceId: string, items: FeedItem[])`: 批量插入新条目，使用 URL 或 GUID 去重（`INSERT OR IGNORE`）。
*   `updateSourceLastFetched(sourceId: string)`: 更新抓取时间。

### 3.3 定时任务 (`app/api/cron/route.ts`)
Next.js (OpenNext) 支持通过 API Route 接收 Cron 请求，或者直接在 Worker 入口处理 `scheduled` 事件。
为了方便开发，我们将创建一个 API Route `/api/cron/update-feeds`。
在 `wrangler.toml` 中配置 `[triggers] crons = ["*/10 * * * *"]` (每10分钟一次)，并让 Worker 在 `scheduled` 事件中调用该 API（或者直接逻辑）。

**逻辑流程**：
1.  从 D1 读取 5 个最久未更新的 Active Sources。
2.  `Promise.allSettled` 并发抓取这 5 个源的 URL。
3.  对成功抓取的内容进行解析。
4.  将结果写入 `feed_items` 表。
5.  更新 `sources` 表的 `last_fetched_at`。

## 4. 实施步骤

1.  **安装依赖**：`fast-xml-parser`。
2.  **创建解析器**：实现 `lib/parsers/rss.ts` 和 `lib/parsers/youtube.ts`。
3.  **编写数据库辅助函数**：在 `lib/db.ts` 中实现批量插入和查询逻辑。
4.  **实现 Cron API**：创建 `app/api/cron/route.ts`。
5.  **配置 Wrangler Cron**：在 `wrangler.toml` 添加触发器。
6.  **测试**：
    *   手动访问 `/api/cron` 触发更新。
    *   添加一个 YouTube RSS 源到数据库进行测试。

## 5. 验证计划
1.  **单元测试**：对解析器编写简单的单元测试（Mock XML 数据 -> JSON）。
2.  **集成测试**：
    *   向本地 D1 插入一条 YouTube RSS 链接。
    *   运行 `curl http://localhost:3000/api/cron`。
    *   查询 `feed_items` 表，验证是否出现了视频列表。
