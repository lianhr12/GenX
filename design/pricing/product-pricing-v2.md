# GenX 产品定价方案 V2

> 更新日期: 2026-01-29
> 基于 EvoLink API 成本核算，目标毛利率 20-50%

---

## 一、积分体系概述

### 积分价值
- **1 积分 = $0.015 USD**
- 用户购买积分包或订阅获得积分
- 积分用于消费 AI 生成服务

### 积分有效期
| 来源 | 有效期 |
|------|--------|
| 注册赠送 | 30 天 |
| 订阅每月发放 | 30 天 |
| 积分包购买 | 365 天 |

### 注册赠送积分
- **赠送数量**: 15 积分
- **可体验**: 1 个视频 (Sora 2 Lite) + 2 张图片 (GPT Image Lite)
- **最大成本**: $0.049/用户
- **防刷设计**: 仅够体验核心功能，无法大量生成

---

## 二、订阅计划 (Subscription Plans)

### Free 免费计划
| 项目 | 内容 |
|------|------|
| 月费 | $0 |
| 每月积分 | 15 |
| 积分有效期 | 30 天 |
| 功能限制 | 基础模型、有水印 |
| 可体验 | 1个视频 + 2张图片 |
| Stripe Price ID | - |

### Pro 专业计划
| 项目 | 月付 | 年付 |
|------|------|------|
| 价格 | $9.90/月 | $99/年 ($8.25/月) |
| 每月积分 | 800 | 800 |
| 积分有效期 | 30 天 | 30 天 |
| 功能 | 全部模型、无水印、优先队列 |
| Stripe Price ID | `price_pro_monthly` | `price_pro_yearly` |

---

## 三、积分包 (Credit Packages)

### 定价表
| 套餐 | 价格 | 积分 | 单价 | 折扣 | 推荐 |
|------|------|------|------|------|------|
| Starter | $4.90 | 350 | $0.014 | - | 新用户首选 |
| Basic | $9.90 | 750 | $0.0132 | 6% | |
| Standard | $19.90 | 1,600 | $0.0124 | 11% | ⭐ 推荐 |
| Premium | $49.90 | 4,200 | $0.0119 | 15% | |
| Enterprise | $99.90 | 9,000 | $0.0111 | 20% | 重度用户 |

### Stripe 产品配置
```
Starter:    price_credits_starter    $4.90   → 350 积分
Basic:      price_credits_basic      $9.90   → 750 积分
Standard:   price_credits_standard   $19.90  → 1,600 积分
Premium:    price_credits_premium    $49.90  → 4,200 积分
Enterprise: price_credits_enterprise $99.90  → 9,000 积分
```

---

## 四、视频生成积分消耗

### 模型定价表

| 模型 | 基础积分 | 每秒增加 | 高清加成 | 说明 |
|------|----------|----------|----------|------|
| **Sora 2 Lite** | 5 | +0.5/秒 | - | 入门推荐，性价比高 |
| **Sora 2** | 35 | +3/秒 | - | 高质量，专业用户 |
| **Wan 2.6 (720p)** | 55 | +5/秒 | - | 快速生成 |
| **Wan 2.6 (1080p)** | 90 | +8/秒 | - | 高清输出 |
| **Veo 3.1** | 15 | +2/秒 | - | 电影级质量 |
| **Seedance 1.5** | 20 | +2/秒 | 1.8x | 创意动画 |
| **Kling 2** | 45 | +4/秒 | - | 文生视频专家 |

### 积分计算公式
```
总积分 = 基础积分 + max(0, 时长-10) × 每秒增加 × 高清加成
```

### 消耗示例
| 场景 | 模型 | 时长 | 质量 | 积分 | 约合 |
|------|------|------|------|------|------|
| 快速测试 | Sora 2 Lite | 10s | 标准 | 5 | $0.075 |
| 社交短视频 | Seedance 1.5 | 10s | 720P | 20 | $0.30 |
| 高清短视频 | Seedance 1.5 | 10s | 1080P | 36 | $0.54 |
| 专业制作 | Sora 2 | 10s | 标准 | 35 | $0.525 |
| 长视频 | Wan 2.6 | 15s | 1080p | 130 | $1.95 |

---

## 五、图片生成积分消耗

### 模型定价表
| 模型 | 基础积分 | 高清加成 | 说明 |
|------|----------|----------|------|
| **GPT Image 1.5** | 8 | 1.5x | 高质量，推荐 |
| **GPT Image 1.5 Lite** | 4 | 1.5x | 快速生成 |
| **Seedream 4.5** | 6 | 1.5x | 2K/4K 质量 |
| **Seedream 4.0** | 5 | 1.5x | 故事驱动 |
| **Nanobanana Pro** | 10 | 1.5x | Gemini 技术 |
| **Wan 2.5** | 5 | 1.5x | 通义万相 |

### 积分计算公式
```
总积分 = 基础积分 × 图片数量 × 高清加成
```

### 消耗示例
| 场景 | 模型 | 数量 | 质量 | 积分 | 约合 |
|------|------|------|------|------|------|
| 单张测试 | GPT Image Lite | 1 | 标准 | 4 | $0.06 |
| 批量生成 | Seedream 4.0 | 4 | 标准 | 20 | $0.30 |
| 高清海报 | GPT Image 1.5 | 1 | HD | 12 | $0.18 |
| 批量高清 | Nanobanana Pro | 4 | HD | 60 | $0.90 |

---

## 六、成本与利润分析

### 视频模型利润率
| 模型 | 用户支付 | API成本 | 毛利 | 毛利率 |
|------|----------|---------|------|--------|
| Sora 2 Lite (10s) | $0.075 | $0.033 | $0.042 | 56% |
| Sora 2 (10s) | $0.525 | $0.329 | $0.196 | 37% |
| Wan 2.6 720p (10s) | $0.825 | $0.729 | $0.096 | 12% |
| Wan 2.6 1080p (10s) | $1.35 | $1.217 | $0.133 | 10% |
| Veo 3.1 | $0.225 | $0.173 | $0.052 | 23% |
| Seedance 1.5 (10s) | $0.30 | $0.25 | $0.05 | 17% |
| Kling 2 (5s) | $0.675 | $0.572 | $0.103 | 15% |

### 图片模型利润率
| 模型 | 用户支付 | API成本 | 毛利 | 毛利率 |
|------|----------|---------|------|--------|
| GPT Image 1.5 | $0.12 | $0.013 | $0.107 | 89% |
| GPT Image Lite | $0.06 | $0.008 | $0.052 | 87% |
| Seedream 4.5 | $0.09 | $0.028 | $0.062 | 69% |
| Seedream 4.0 | $0.075 | $0.019 | $0.056 | 75% |
| Nanobanana Pro | $0.15 | $0.043 | $0.107 | 71% |
| Wan 2.5 | $0.075 | $0.021 | $0.054 | 72% |

### 综合毛利预估
- **图片业务**: 70-89% 毛利率 (高利润)
- **视频业务**: 10-56% 毛利率 (中等利润)
- **综合预估**: 35-50% 整体毛利率

---

## 七、Stripe 产品创建清单

### 订阅产品 (Subscription)
```yaml
# Pro Monthly
- Product Name: GenX Pro Monthly
- Price: $9.90/month
- Price ID: price_pro_monthly
- Metadata:
    plan: pro
    interval: month
    credits: 800

# Pro Yearly
- Product Name: GenX Pro Yearly
- Price: $99.00/year
- Price ID: price_pro_yearly
- Metadata:
    plan: pro
    interval: year
    credits: 800
```

### 积分包产品 (One-time)
```yaml
# Starter
- Product Name: GenX Credits - Starter
- Price: $4.90
- Price ID: price_credits_starter
- Metadata:
    type: credits
    amount: 350
    expireDays: 365

# Basic
- Product Name: GenX Credits - Basic
- Price: $9.90
- Price ID: price_credits_basic
- Metadata:
    type: credits
    amount: 750
    expireDays: 365

# Standard
- Product Name: GenX Credits - Standard
- Price: $19.90
- Price ID: price_credits_standard
- Metadata:
    type: credits
    amount: 1600
    popular: true
    expireDays: 365

# Premium
- Product Name: GenX Credits - Premium
- Price: $49.90
- Price ID: price_credits_premium
- Metadata:
    type: credits
    amount: 4200
    expireDays: 365

# Enterprise
- Product Name: GenX Credits - Enterprise
- Price: $99.90
- Price ID: price_credits_enterprise
- Metadata:
    type: credits
    amount: 9000
    expireDays: 365
```

---

## 八、代码配置更新

### website.tsx 配置
```typescript
price: {
  plans: {
    free: {
      id: 'free',
      prices: [],
      isFree: true,
      credits: { enable: true, amount: 15, expireDays: 30 },
    },
    pro: {
      id: 'pro',
      prices: [
        {
          type: PaymentTypes.SUBSCRIPTION,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
          amount: 990,
          currency: 'USD',
          interval: PlanIntervals.MONTH,
        },
        {
          type: PaymentTypes.SUBSCRIPTION,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
          amount: 9900,
          currency: 'USD',
          interval: PlanIntervals.YEAR,
        },
      ],
      isFree: false,
      popular: true,
      credits: { enable: true, amount: 800, expireDays: 30 },
    },
  },
},
credits: {
  enableCredits: true,
  enablePackagesForFreePlan: true,
  registerGiftCredits: { enable: true, amount: 15, expireDays: 30 },
  packages: {
    starter: {
      id: 'starter',
      popular: false,
      amount: 350,
      expireDays: 365,
      price: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER!,
        amount: 490,
        currency: 'USD',
      },
    },
    basic: {
      id: 'basic',
      popular: false,
      amount: 750,
      expireDays: 365,
      price: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC!,
        amount: 990,
        currency: 'USD',
      },
    },
    standard: {
      id: 'standard',
      popular: true,
      amount: 1600,
      expireDays: 365,
      price: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD!,
        amount: 1990,
        currency: 'USD',
      },
    },
    premium: {
      id: 'premium',
      popular: false,
      amount: 4200,
      expireDays: 365,
      price: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM!,
        amount: 4990,
        currency: 'USD',
      },
    },
    enterprise: {
      id: 'enterprise',
      popular: false,
      amount: 9000,
      expireDays: 365,
      price: {
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE!,
        amount: 9990,
        currency: 'USD',
      },
    },
  },
},
```

### video-credits.ts 配置
```typescript
export const VIDEO_MODELS: Record<string, ModelConfig> = {
  'sora-2-lite': {
    id: 'sora-2-lite',
    name: 'Sora 2 Lite',
    provider: 'evolink',
    description: 'OpenAI Sora 2 Lite - Fast and affordable',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [10, 15],
    aspectRatios: ['16:9', '9:16'],
    creditCost: { base: 5, perExtraSecond: 0.5 },
  },
  'sora-2': {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'evolink',
    description: 'OpenAI Sora 2 - High quality video generation',
    supportImageToVideo: true,
    maxDuration: 12,
    durations: [4, 8, 12],
    aspectRatios: ['16:9', '9:16'],
    creditCost: { base: 35, perExtraSecond: 3 },
  },
  'wan-2-6-720p': {
    id: 'wan-2-6-720p',
    name: 'Wan 2.6 (720p)',
    provider: 'evolink',
    description: 'Alibaba Wan 2.6 - Fast 720p generation',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    creditCost: { base: 55, perExtraSecond: 5 },
  },
  'wan-2-6-1080p': {
    id: 'wan-2-6-1080p',
    name: 'Wan 2.6 (1080p)',
    provider: 'evolink',
    description: 'Alibaba Wan 2.6 - High quality 1080p',
    supportImageToVideo: true,
    maxDuration: 15,
    durations: [5, 10, 15],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    creditCost: { base: 90, perExtraSecond: 8 },
  },
  'veo-3-1': {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    provider: 'evolink',
    description: 'Google Veo 3.1 - Cinematic quality',
    supportImageToVideo: true,
    maxDuration: 8,
    durations: [4, 6, 8],
    aspectRatios: ['16:9', '9:16'],
    creditCost: { base: 15, perExtraSecond: 2 },
  },
  'seedance-1-5': {
    id: 'seedance-1-5',
    name: 'Seedance 1.5',
    provider: 'evolink',
    description: 'ByteDance Seedance - Creative animations',
    supportImageToVideo: true,
    maxDuration: 12,
    durations: [4, 5, 6, 8, 10, 12],
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
    qualities: ['480P', '720P', '1080P'],
    creditCost: { base: 20, perExtraSecond: 2, highQualityMultiplier: 1.8 },
  },
  'kling-2': {
    id: 'kling-2',
    name: 'Kling 2',
    provider: 'kie',
    description: 'Kuaishou Kling 2 - Text to video specialist',
    supportImageToVideo: false,
    maxDuration: 10,
    durations: [5, 10],
    aspectRatios: ['16:9', '9:16'],
    creditCost: { base: 45, perExtraSecond: 4 },
  },
};
```

---

## 九、环境变量配置

```bash
# .env.local

# Subscription Plans
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxx

# Credit Packages
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=price_xxx
```

---

## 十、定价策略总结

### 用户分层
| 用户类型 | 推荐方案 | 月消费 |
|----------|----------|--------|
| 体验用户 | Free (15积分) | $0 |
| 轻度用户 | Starter 积分包 | $4.90 |
| 普通用户 | Pro 订阅 | $9.90 |
| 重度用户 | Pro + Standard 积分包 | $29.80 |
| 专业用户 | Pro + Enterprise 积分包 | $109.80 |

### 引流策略
- 注册送 15 积分 (可生成 1 个视频 + 2 张图片)
- 防刷设计：仅够体验核心功能，成本可控 ($0.049/用户)
- Sora 2 Lite 作为低价引流模型
- 积分包阶梯折扣鼓励大额购买

### 盈利保障
- 图片业务 70%+ 毛利率
- 视频业务 15-56% 毛利率
- 综合毛利率 35-50%
