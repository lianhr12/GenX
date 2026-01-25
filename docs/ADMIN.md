# 管理脚本

本文档包含了用于管理应用程序的各种管理脚本。

## 脚本概述

所有脚本都位于 `/scripts` 目录中，可以使用项目根目录的 `pnpm` 命令运行。

### 可用脚本

- `list-users` - 列出数据库中的所有用户
- `list-contacts` - 列出新闻订阅联系人
- `fix-payments` - 修复已完成的支付状态
- `fix-payments-scene` - 修复支付场景字段
- `add-credits` - 给特定用户账户添加积分

## 给用户账户添加积分

### 命令行使用

`add-credits` 脚本允许您手动给任何用户账户添加积分。

```bash
pnpm add-credits <用户邮箱> <积分数量> [描述] [过期天数]
```

#### 参数

- **用户邮箱**（必需）：用户的电子邮件地址
- **积分数量**（必需）：要添加的积分数量（必须为正数）
- **描述**（可选）：添加积分的原因说明
- **过期天数**（可选）：积分过期的天数

#### 示例

```bash
# 给用户添加 1000 积分
pnpm add-credits user@example.com 1000

# 带描述地添加积分
pnpm add-credits user@example.com 1000 "管理员奖励"

# 添加 30 天后过期的积分
pnpm add-credits user@example.com 1000 "促销积分" 30

# 带描述和过期的添加积分
pnpm add-credits user@example.com 500 "欢迎奖励" 60
```

### 编程使用

您也可以在代码中以编程方式添加积分：

```typescript
import { addCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';

// 给用户添加积分
await addCredits({
  userId: '用户ID',
  amount: 1000,
  type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
  description: '管理员手动添加积分',
  expireDays: 30, // 可选：积分 30 天后过期
});
```

### 积分交易类型

添加积分时，您可以指定不同的交易类型：

- `PURCHASE_PACKAGE` - 通过支付购买的积分
- `REGISTER_GIFT` - 注册赠送积分
- `MONTHLY_REFRESH` - 免费用户的月度免费积分
- `SUBSCRIPTION_RENEWAL` - 订阅续费获得的积分
- `USAGE` - 积分消耗（负数）
- `EXPIRE` - 积分过期（负数）

### 添加积分时会发生什么

1. 脚本根据用户的电子邮件地址查找用户
2. 更新 `user_credit` 表中的用户积分余额
3. 在 `credit_transaction` 表中创建交易记录
4. 如果指定了 `expireDays`，则设置积分的过期日期
5. 记录操作以供审计

### 安全注意事项

- 脚本需要访问数据库（确保 `.env` 已正确配置）
- 所有积分添加都会记录描述以供审计跟踪
- 具有过期日期的积分将被过期系统自动处理

### 故障排除

#### 未找到用户

```text
错误：未找到邮箱为 user@example.com 的用户
```

解决方案：验证电子邮件地址是否正确，以及用户是否存在于数据库中。

#### 无效金额

```text
错误：请提供用户邮箱和积分数量
```

解决方案：确保您提供的是一个正整数作为积分数量。

#### 数据库连接错误

解决方案：检查您的 `.env` 文件，确保数据库凭据正确。

## 其他管理脚本

### 列出用户

```bash
# 列出所有用户
pnpm list-users
```

此脚本显示数据库中的所有用户及其 ID、电子邮件、姓名和创建日期。

### 修复支付

```bash
# 修复已完成支付的支付状态
pnpm fix-payments
```

此脚本更新已完成但未标记为已支付支付记录。

### 列出联系人

```bash
# 列出新闻订阅者
pnpm list-contacts
```

此脚本显示所有新闻订阅者及其订阅状态。

## 最佳实践

1. **手动添加积分时始终添加描述**以供审计
2. **考虑促销积分的过期时间**以鼓励使用
3. **保留手动积分添加的记录**以供客户支持
4. **先用少量金额测试**以确保一切正常工作
5. **使用适当的交易类型**以保持清晰的会计记录

## 创建新的管理脚本

创建新的管理脚本时：

1. 将它们放在 `/scripts` 目录中
2. 使用 TypeScript 以确保类型安全
3. 使用 `dotenv.config()` 加载环境变量
4. 将脚本命令添加到 `package.json`
5. 包含适当的错误处理和日志记录
6. 遵循现有的命名约定（kebab-case）

脚本模板示例：

```typescript
import dotenv from 'dotenv';
import { getDb } from '../src/db/index.js';
dotenv.config();

async function main() {
  const db = await getDb();
  
  try {
    // 您的管理逻辑在这里
    console.log('操作成功完成');
  } catch (error) {
    console.error('操作失败：', error);
    process.exit(1);
  }
}

main();
```
