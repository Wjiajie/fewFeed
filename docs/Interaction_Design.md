# 交互设计文档 (IxD): FewFeed

## 1. 设计目标与原则
*   **极简主义 (Minimalism)**：去除所有无关干扰，内容为王。使用大量留白，清晰的排版。
*   **高信噪比 (High Signal-to-Noise)**：视觉重心始终在信息本身，而非装饰性元素。
*   **即时反馈 (Instant Feedback)**：所有的交互（点击、提交）都应有微动效或状态提示，特别是 AI 生成过程。
*   **边缘原生感 (Edge Native Feel)**：利用 Edge 渲染优势，追求 "Instant navigate" 的极速体验。

## 2. 信息架构 (Information Architecture)

### 2.1 站点地图 (Site Map)
*   **Landing Page (未登录)**
    *   Hero Section (价值主张 + 演示视频)
    *   Features (去算法、AI 摘要、边缘计算)
    *   Call to Action (GitHub 登录)
*   **App 主界面 (已登录)**
    *   **Sidebar (左侧导航)**
        *   Logo
        *   "All Feeds" (聚合流 - 默认视图)
        *   "Smart Lists" (如：必读、视频、文章)
        *   Sources List (订阅源列表，带 Favicon)
        *   "Add Source" (+ 按钮)
        *   User Profile / Settings (底部)
    *   **Main Content Area (中间)**
        *   Feed Stream (卡片流)
    *   **Context Panel (右侧 - 动态呼出)**
        *   Source Details (源信息)
        *   **AI Chat Context (对话窗口)**

## 3. 核心交互流程 (Key User Flows)

### 3.1 订阅新信源 (Adding a Source)
1.  **触发**：用户点击 Sidebar 的 "+" 按钮，或按快捷键 `C`.
2.  **模态窗 (Modal)**：
    *   弹出一个简洁的 Dialog，只有单一输入框："Paste URL anywhere (YouTube, Jike, Blog...)"。
    *   **智能识别**：输入 URL 后，即时校验并显示识别结果（例如显示 "即刻动态" 或 "YouTube 频道" 的图标）。
    *   **频率设置**：简单的 Dropdown 选择更新频率（默认 "Daily"）。
3.  **确认与反馈**：
    *   点击 "Subscribe"。
    *   按钮变为 Loading 状态。
    *   成功后，Toast 提示 "Added successfully"，左侧 Sidebar 列表自动刷新高亮新源。
    *   后台触发一次立即抓取 (Optimistic UI)。

### 3.2 浏览与阅读 (The Feed Experience)
1.  **卡片流**：
    *   采用 **Masonry (瀑布流)** 或 **Single Column (单栏)** 布局（用户可配置，默认单栏以专注阅读）。
    *   **未读状态**：新条目左侧有微小的强调色竖线。
2.  **摘要展开**：
    *   卡片默认显示：[源图标] [源名称] [时间] [标题] [3行 AI 摘要]。
    *   **交互**：点击卡片任意非链接区域 -> 卡片向下展开 (Accordion 效果)。
    *   **展开内容**：显示完整 AI 摘要、关键金句引用、以及 "Chat" 和 "Original Link" 按钮。

### 3.3 AI 智能对话 (Chat with Content)
1.  **触发**：在展开的 Feed 卡片中点击 "Chat" 图标。
2.  **面板滑出**：右侧 Context Panel 滑出（桌面端）或 Sheet 底部弹起（移动端）。
3.  **对话初始态**：
    *   AI 主动发送一条基于该内容的开场白，例如："这篇关于 Next.js 的文章主要讨论了 Server Actions。你想了解具体代码实现还是优缺点？"
    *   提供 3 个快捷追问 Chips（如 "总结要点", "提取链接", "翻译为英文"）。
4.  **多轮对话**：用户输入问题，AI 基于 R2 中存储的完整内容进行 RAG 回答。支持流式输出 (Streaming UI)。

## 4. 界面设计规范 (Design System Specs)
基于 **shadcn/ui** 定制。

### 4.1 色彩系统 (Color Palette)
*   **Primary**: `Zinc-950` (深灰黑，用于主文字/按钮) - 营造沉稳的高级感。
*   **Background**: `Zinc-50` (米白/极浅灰) - 护眼，避免纯白的刺眼。
*   **Accent**: `Indigo-600` (靛蓝) - 用于高亮操作、链接、New 提示。
*   **Semantic**:
    *   YouTube Red: `Rose-600`
    *   Jike Yellow: `Yellow-400` (需配合深色文字确保可读性)
*   **Dark Mode**: 必须完美支持，默认跟随系统。

### 4.2 字体 (Typography)
*   **英文字体**: `Inter` 或 `Geist Sans` (Vercel 出品，适合技术类阅读)。
*   **中文字体**: 系统默认无衬线栈 (`PingFang SC`, `Microsoft YaHei`)，确保跨平台清晰度。
*   **代码字体**: `JetBrains Mono` 或 `Geist Mono`。

### 4.3 组件风格 (Component Style)
*   **Radius**: `0.5rem` (适中的圆角，既不锐利也不过于圆润)。
*   **Shadows**: 极轻微的阴影 (`shadow-sm`)，主要通过边框 (`border-zinc-200`) 区分层级。
*   **Animations**: 使用 `framer-motion` 实现列表载入、面板滑出的平滑过渡。

## 5. 响应式策略 (Responsive Strategy)
*   **Desktop (>1024px)**: 三栏布局 (Sidebar + Feed + Chat Panel)。
*   **Tablet (768px - 1024px)**: 双栏布局，Sidebar 变为图标栏，Chat Panel 覆盖在 Feed 上方。
*   **Mobile (<768px)**: 单栏布局。
    *   Sidebar 收入汉堡菜单 (Sheet)。
    *   Chat 界面全屏弹出 (Drawer)。
    *   Feed 卡片简化，仅展示标题和摘要缩略。
