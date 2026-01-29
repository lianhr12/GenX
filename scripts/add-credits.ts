import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { addCredits } from '../src/credits/credits.js';
import { CREDIT_TRANSACTION_TYPE } from '../src/credits/types.js';
import { getDb } from '../src/db/index.js';
import { user } from '../src/db/schema.js';

dotenv.config();

interface AddCreditsOptions {
  email: string; // 用户邮箱
  amount: number; // 积分数量
  description?: string; // 描述
  expireDays?: number; // 过期天数（可选）
}

async function addCreditsToUser(options: AddCreditsOptions) {
  const { email, amount, description, expireDays } = options;

  if (!email || !amount) {
    console.error('请提供用户邮箱和积分数量');
    process.exit(1);
  }

  const db = await getDb();

  try {
    // 查找用户
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (users.length === 0) {
      console.error(`未找到邮箱为 ${email} 的用户`);
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`找到用户: ${users[0].name} (${email}), ID: ${userId}`);

    // 添加积分
    await addCredits({
      userId,
      amount,
      type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
      description: description || `管理员手动添加积分: ${amount}`,
      expireDays,
    });

    console.log(`成功给用户 ${email} 添加了 ${amount} 积分`);

    if (expireDays) {
      console.log(`积分将在 ${expireDays} 天后过期`);
    }
  } catch (error) {
    console.error('添加积分失败:', error);
    process.exit(1);
  }
}

// 从命令行参数获取信息
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('使用方法:');
  console.log('  pnpm add-credits <用户邮箱> <积分数量> [描述] [过期天数]');
  console.log('');
  console.log('示例:');
  console.log('  pnpm add-credits user@example.com 1000 "管理员赠送" 30');
  process.exit(1);
}

const email = args[0];
const amount = Number.parseInt(args[1]);
const description = args[2];
const expireDays = args[3] ? Number.parseInt(args[3]) : undefined;

// 执行添加积分
addCreditsToUser({
  email,
  amount,
  description,
  expireDays,
});
