# GenX.art

每一帧都是艺术 - AI 艺术视频创作平台

在 30 秒内将您的照片转化为令人惊叹的电影艺术视频。无需技能，无需昂贵的软件。

## 特性

- **图片转视频**：上传照片并将其转化为美丽的艺术视频
- **文本转视频**：描述您的愿景，让 AI 创作令人惊叹的视频
- **5 种独特的艺术风格**：赛博朋克、水彩、油画、动漫、流体艺术
- **快速生成**：在大约 30 秒内获得您的艺术视频
- **无需技能**：任何人都可以使用的简单界面

## 技术栈

- **框架**：Next.js 15 (App Router)
- **数据库**：PostgreSQL with Drizzle ORM
- **认证**：Better Auth with social providers (Google, GitHub)
- **支付**：Stripe integration
- **UI**：Radix UI + TailwindCSS
- **状态管理**：Zustand
- **国际化**：next-intl (English & Chinese)

## 开始

### 前提条件

- Node.js 18+
- pnpm
- PostgreSQL 数据库

### 安装

1. 克隆仓库
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 复制环境变量：
   ```bash
   cp env.example .env
   ```
4. 配置您的环境变量
5. 运行数据库迁移：
   ```bash
   pnpm db:migrate
   ```
6. 启动开发服务器：
   ```bash
   pnpm dev
   ```

## 可用脚本

### 开发
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行代码检查
- `pnpm format` - 格式化代码

### 数据库
- `pnpm db:generate` - 生成数据库迁移
- `pnpm db:migrate` - 应用数据库迁移
- `pnpm db:push` - 推送架构更改（仅开发环境）
- `pnpm db:studio` - 打开 Drizzle Studio

### 管理脚本
- `pnpm list-users` - 列出所有用户
- `pnpm list-contacts` - 列出新闻订阅联系人
- `pnpm fix-payments` - 修复支付状态
- `pnpm add-credits` - 给用户添加积分（参见 [docs/ADMIN.md](./docs/ADMIN.md)）
   ```bash
   pnpm add-credits user@example.com 1000 "管理员奖励" 30
   ```

有关管理操作的更多详情，请参阅 [管理脚本文档](./docs/ADMIN.md)。

## 项目结构

```
src/
├── app/           # Next.js app router 页面
├── components/    # React 组件
├── config/        # 应用配置
├── db/            # 数据库架构和迁移
├── lib/           # 工具函数
├── hooks/         # 自定义 React hooks
├── stores/        # Zustand 状态存储
├── ai/            # AI 视频生成逻辑
├── payment/       # 支付集成
└── mail/          # 邮件模板
```

## 链接

- 网站：[genx.art](https://genx.art)
- 支持：[support@genx.art](mailto:support@genx.art)

## 许可证

详情请参阅 [LICENSE](LICENSE)。
