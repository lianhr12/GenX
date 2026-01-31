# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with content collections
- `pnpm build` - Build the application and content collections
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter (use for code quality checks)
- `pnpm format` - Format code with Biome

### Database Operations (Drizzle ORM)
- `pnpm db:generate` - Generate new migration files based on schema changes
- `pnpm db:migrate` - Apply pending migrations to the database
- `pnpm db:push` - Sync schema changes directly to the database (development only)
- `pnpm db:studio` - Open Drizzle Studio for database inspection and management

### Content and Email
- `pnpm content` - Process MDX content collections
- `pnpm email` - Start email template development server on port 3333

## Project Architecture

This is a Next.js full-stack SaaS application with the following key architectural components:

### Core Stack
- **Framework**: Next.js with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with social providers (Google, GitHub)
- **Payments**: Stripe integration with subscription and one-time payments
- **UI**: Radix UI components with TailwindCSS
- **State Management**: Zustand for client-side state
- **Internationalization**: next-intl with English and Chinese locales
- **Content**: Fumadocs for documentation and MDX for content
- **Code Quality**: Biome for formatting and linting

### Key Directory Structure
- `src/app/` - Next.js app router with internationalized routing
- `src/components/` - Reusable React components organized by feature
- `src/lib/` - Utility functions and shared code
- `src/db/` - Database schema and migrations
- `src/actions/` - Server actions for API operations
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/config/` - Application configuration files
- `src/i18n/` - Internationalization setup
- `src/mail/` - Email templates and mail functionality
- `src/payment/` - Stripe payment integration
- `src/credits/` - Credit system implementation
- `content/` - MDX content files for docs and blog
- `messages/` - Translation files (en.json, zh.json) for internationalization

### Authentication & User Management
- Uses Better Auth with PostgreSQL adapter
- Supports email/password and social login (Google, GitHub)
- Includes user management, email verification, and password reset
- Admin plugin for user management and banning
- Automatic newsletter subscription on user creation

### Payment System
- Stripe integration for subscriptions and one-time payments
- Three pricing tiers: Free, Pro (monthly/yearly), and Lifetime
- Credit system with packages for pay-per-use features
- Customer portal for subscription management

### Feature Modules
- **Blog**: MDX-based blog with pagination and categories
- **Docs**: Fumadocs-powered documentation
- **AI Features**: Image generation with multiple providers (OpenAI, Replicate, etc.)
- **Newsletter**: Email subscription system
- **Analytics**: Multiple analytics providers support
- **Storage**: S3 integration for file uploads

### Development Workflow
1. Use TypeScript for all new code
2. Follow Biome formatting rules (single quotes, trailing commas)
3. Write server actions in `src/actions/`
4. Use Zustand for client-side state management
5. Implement database changes through Drizzle migrations
6. Use Radix UI components for consistent UI
7. Follow the established directory structure
8. Use proper error handling with error.tsx and not-found.tsx
9. Leverage Next.js features like Server Actions
10. Use `next-safe-action` for secure form submissions

### Configuration
- Main config in `src/config/website.tsx`
- Environment variables template in `env.example`
- Database config in `drizzle.config.ts`
- Biome config in `biome.json` with specific ignore patterns
- TypeScript config with path aliases (@/* for src/*)

### Testing and Quality
- Use Biome for linting and formatting
- TypeScript for type safety
- Environment variables for configuration
- Proper error boundaries and not-found pages
- Zod for runtime validation

## Important Notes

- The project uses pnpm as the package manager
- Database schema is in `src/db/schema.ts` with auth, payment, and credit tables
- Email templates are in `src/mail/templates/`
- The app supports both light and dark themes
- Content is managed through MDX files in the `content/` directory
- The project includes comprehensive internationalization support

### 文件操作规范

**创建/写入文件**：

- ✅ **优先使用** `Write` 工具 - 适用于所有文件大小
  ```typescript
  // Write 工具是 Claude Code 推荐的标准方法
  // 支持中小型文件（< 1000 行）
  // 类型安全，简单直接
  ```
- ✅ **大文件策略** - 当文件超过 1000 行时：
  - **方案 A**：分段创建多个小文件，最后合并
  - **方案 B**：使用 Write 工具创建主体，Edit 工具补充细节
  - **方案 C**：创建文件骨架，让用户补充内容
- ❌ **禁止使用** `Bash` 的 `cat`/`echo`/`printf` 创建文件
  - 原因：违反项目规范，难以维护，不利于类型检查
  - 例外：仅在 Write 工具确实无法工作时作为紧急备用

**文件操作最佳实践**：

1. **读取优先**：编辑现有文件前必须先用 `Read` 工具读取
2. **精确编辑**：使用 `Edit` 工具进行精确字符串替换
3. **路径规范**：始终使用绝对路径，避免相对路径
4. **编码安全**：确保文件使用 UTF-8 编码
5. **验证结果**：文件操作后使用 `Read` 或 `Bash ls` 验证