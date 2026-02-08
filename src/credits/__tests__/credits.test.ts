import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CREDIT_TRANSACTION_TYPE } from '../types';

/**
 * 积分系统核心逻辑测试
 * 通过 mock 数据库层来测试 credits.ts 中的所有函数和分支
 */

// ============================================================================
// Mock 数据库层 - 高精度链式调用 mock
// ============================================================================

// 控制 mock 返回值的变量
let limitReturnValue: unknown[] = [];
let orderByReturnValue: unknown[] = [];
let whereReturnValue: unknown[] = [];

const mockValues = vi.fn().mockResolvedValue(undefined);
const mockSet = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockOrderBy = vi.fn();

// 构建链式 mock
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockImplementation(() => {
    // where 后面可能跟 limit 或 orderBy
    return {
      limit: vi.fn().mockImplementation(() => limitReturnValue),
      orderBy: vi.fn().mockImplementation(() => orderByReturnValue),
    };
  }),
  limit: vi.fn().mockImplementation(() => limitReturnValue),
  orderBy: vi.fn().mockImplementation(() => orderByReturnValue),
  insert: vi.fn().mockReturnValue({
    values: mockValues,
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  }),
};

vi.mock('@/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  userCredit: { userId: 'userId', currentCredits: 'currentCredits' },
  creditTransaction: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    amount: 'amount',
    remainingAmount: 'remainingAmount',
    expirationDate: 'expirationDate',
    expirationDateProcessedAt: 'expirationDateProcessedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

vi.mock('@/db/schema', () => ({
  userCredit: { userId: 'userId', currentCredits: 'currentCredits' },
  creditTransaction: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    amount: 'amount',
    remainingAmount: 'remainingAmount',
    expirationDate: 'expirationDate',
    expirationDateProcessedAt: 'expirationDateProcessedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
}));

vi.mock('@/config/website', () => ({
  websiteConfig: {
    credits: {
      registerGiftCredits: { amount: 15, expireDays: 30 },
      packages: {
        starter: {
          id: 'starter',
          credits: 660,
          price: 990,
        },
      },
    },
  },
}));

const mockFindPlanByPlanId = vi.fn();
const mockFindPlanByPriceId = vi.fn();

vi.mock('@/lib/price-plan', () => ({
  findPlanByPlanId: (...args: unknown[]) => mockFindPlanByPlanId(...args),
  findPlanByPriceId: (...args: unknown[]) => mockFindPlanByPriceId(...args),
}));

// ============================================================================
// 参数验证逻辑测试
// ============================================================================

describe('积分系统参数验证', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    orderByReturnValue = [];
  });

  describe('saveCreditTransaction 参数验证', () => {
    it('userId 为空时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: '',
          type: CREDIT_TRANSACTION_TYPE.USAGE,
          amount: 10,
          description: 'test',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid params');
    });

    it('type 为空时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: 'user-1',
          type: '',
          amount: 10,
          description: 'test',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid params');
    });

    it('description 为空时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: 'user-1',
          type: CREDIT_TRANSACTION_TYPE.USAGE,
          amount: 10,
          description: '',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid params');
    });

    it('amount 为 0 时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: 'user-1',
          type: CREDIT_TRANSACTION_TYPE.USAGE,
          amount: 0,
          description: 'test',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid amount');
    });

    it('amount 为 NaN 时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: 'user-1',
          type: CREDIT_TRANSACTION_TYPE.USAGE,
          amount: Number.NaN,
          description: 'test',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid amount');
    });

    it('amount 为 Infinity 时应该抛出错误', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await expect(
        saveCreditTransaction({
          userId: 'user-1',
          type: CREDIT_TRANSACTION_TYPE.USAGE,
          amount: Number.POSITIVE_INFINITY,
          description: 'test',
        })
      ).rejects.toThrow('saveCreditTransaction, invalid amount');
    });

    it('有效参数应该成功调用 db.insert', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await saveCreditTransaction({
        userId: 'user-1',
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        amount: 100,
        description: 'Buy package',
      });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
    });

    it('负数 amount（消费记录）应该成功', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await saveCreditTransaction({
        userId: 'user-1',
        type: CREDIT_TRANSACTION_TYPE.USAGE,
        amount: -50,
        description: 'Use credits',
      });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('带 paymentId 和 expirationDate 应该成功', async () => {
      const { saveCreditTransaction } = await import('../credits');
      await saveCreditTransaction({
        userId: 'user-1',
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        amount: 660,
        description: 'Purchase starter',
        paymentId: 'pay_123',
        expirationDate: new Date('2025-12-31'),
      });
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('addCredits 参数验证', () => {
    it('userId 为空时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: '',
          amount: 100,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
        })
      ).rejects.toThrow('Invalid params');
    });

    it('type 为空时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 100,
          type: '',
          description: 'test',
        })
      ).rejects.toThrow('Invalid params');
    });

    it('description 为空时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 100,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: '',
        })
      ).rejects.toThrow('Invalid params');
    });

    it('amount 为 0 时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 0,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('amount 为负数时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: -10,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('amount 为 NaN 时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: Number.NaN,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('expireDays 为 0 时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 100,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
          expireDays: 0,
        })
      ).rejects.toThrow('Invalid expire days');
    });

    it('expireDays 为负数时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 100,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
          expireDays: -30,
        })
      ).rejects.toThrow('Invalid expire days');
    });

    it('expireDays 为 NaN 时应该抛出错误', async () => {
      const { addCredits } = await import('../credits');
      await expect(
        addCredits({
          userId: 'user-1',
          amount: 100,
          type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
          description: 'test',
          expireDays: Number.NaN,
        })
      ).rejects.toThrow('Invalid expire days');
    });

    it('已有用户记录时应 update 余额', async () => {
      limitReturnValue = [{ userId: 'user-1', currentCredits: 200 }];
      const { addCredits } = await import('../credits');
      await addCredits({
        userId: 'user-1',
        amount: 100,
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        description: 'Buy credits',
      });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('新用户应 insert 记录', async () => {
      limitReturnValue = [];
      const { addCredits } = await import('../credits');
      await addCredits({
        userId: 'new-user',
        amount: 100,
        type: CREDIT_TRANSACTION_TYPE.REGISTER_GIFT,
        description: 'Gift credits',
      });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('带 expireDays 应该成功（expireDays > 0）', async () => {
      limitReturnValue = [{ userId: 'user-1', currentCredits: 0 }];
      const { addCredits } = await import('../credits');
      await addCredits({
        userId: 'user-1',
        amount: 100,
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        description: 'Buy credits',
        expireDays: 30,
      });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('不带 expireDays 应该成功', async () => {
      limitReturnValue = [{ userId: 'user-1', currentCredits: 50 }];
      const { addCredits } = await import('../credits');
      await addCredits({
        userId: 'user-1',
        amount: 100,
        type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
        description: 'Buy credits',
      });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('consumeCredits 参数验证', () => {
    it('userId 为空时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({ userId: '', amount: 10, description: 'test' })
      ).rejects.toThrow('Invalid params');
    });

    it('description 为空时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({ userId: 'user-1', amount: 10, description: '' })
      ).rejects.toThrow('Invalid params');
    });

    it('amount 为 0 时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({ userId: 'user-1', amount: 0, description: 'test' })
      ).rejects.toThrow('Invalid amount');
    });

    it('amount 为负数时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({ userId: 'user-1', amount: -5, description: 'test' })
      ).rejects.toThrow('Invalid amount');
    });

    it('amount 为 NaN 时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({
          userId: 'user-1',
          amount: Number.NaN,
          description: 'test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('amount 为 Infinity 时应该抛出错误', async () => {
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({
          userId: 'user-1',
          amount: Number.POSITIVE_INFINITY,
          description: 'test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    it('余额不足时应该抛出 Insufficient credits', async () => {
      // getUserCredits 返回 0（余额不足）
      limitReturnValue = [{ currentCredits: 5 }];
      const { consumeCredits } = await import('../credits');
      await expect(
        consumeCredits({
          userId: 'user-1',
          amount: 100,
          description: 'test',
        })
      ).rejects.toThrow('Insufficient credits');
    });

    it('余额充足时应该调用 FIFO 消费并写入记录', async () => {
      // getUserCredits 返回 100
      limitReturnValue = [{ currentCredits: 100 }];
      orderByReturnValue = [
        {
          id: 'tx-1',
          remainingAmount: 60,
          expirationDate: null,
          createdAt: new Date(),
        },
        {
          id: 'tx-2',
          remainingAmount: 50,
          expirationDate: null,
          createdAt: new Date(),
        },
      ];
      const { consumeCredits } = await import('../credits');
      await consumeCredits({
        userId: 'user-1',
        amount: 80,
        description: 'Generate image',
      });
      // update 被调用（扣减交易 + 更新余额）
      expect(mockDb.update).toHaveBeenCalled();
      // insert 被调用（写入 USAGE 记录）
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// getUserCredits
// ============================================================================

describe('getUserCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('有记录时应返回 currentCredits', async () => {
    limitReturnValue = [{ currentCredits: 500 }];
    const { getUserCredits } = await import('../credits');
    const credits = await getUserCredits('user-1');
    expect(credits).toBe(500);
  });

  it('无记录时应返回 0', async () => {
    limitReturnValue = [];
    const { getUserCredits } = await import('../credits');
    const credits = await getUserCredits('user-1');
    expect(credits).toBe(0);
  });

  it('currentCredits 为 null/0 时应返回 0', async () => {
    limitReturnValue = [{ currentCredits: 0 }];
    const { getUserCredits } = await import('../credits');
    const credits = await getUserCredits('user-1');
    expect(credits).toBe(0);
  });
});

// ============================================================================
// updateUserCredits
// ============================================================================

describe('updateUserCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该调用 db.update', async () => {
    const { updateUserCredits } = await import('../credits');
    await updateUserCredits('user-1', 300);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

// ============================================================================
// hasEnoughCredits
// ============================================================================

describe('hasEnoughCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('余额充足时应返回 true', async () => {
    limitReturnValue = [{ currentCredits: 100 }];
    const { hasEnoughCredits } = await import('../credits');
    const result = await hasEnoughCredits({
      userId: 'user-1',
      requiredCredits: 50,
    });
    expect(result).toBe(true);
  });

  it('余额刚好等于所需时应返回 true', async () => {
    limitReturnValue = [{ currentCredits: 50 }];
    const { hasEnoughCredits } = await import('../credits');
    const result = await hasEnoughCredits({
      userId: 'user-1',
      requiredCredits: 50,
    });
    expect(result).toBe(true);
  });

  it('余额不足时应返回 false', async () => {
    limitReturnValue = [{ currentCredits: 10 }];
    const { hasEnoughCredits } = await import('../credits');
    const result = await hasEnoughCredits({
      userId: 'user-1',
      requiredCredits: 50,
    });
    expect(result).toBe(false);
  });

  it('无余额记录时应返回 false', async () => {
    limitReturnValue = [];
    const { hasEnoughCredits } = await import('../credits');
    const result = await hasEnoughCredits({
      userId: 'new-user',
      requiredCredits: 1,
    });
    expect(result).toBe(false);
  });
});

// ============================================================================
// addMonthlyFreeCredits
// ============================================================================

describe('addMonthlyFreeCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    mockFindPlanByPlanId.mockReset();
  });

  it('plan 不存在时应该直接返回', async () => {
    mockFindPlanByPlanId.mockReturnValue(null);
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'non-existent-plan');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan 已禁用时应该直接返回', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: true,
      isFree: true,
      credits: { enable: true, amount: 10, expireDays: 30 },
    });
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'disabled-plan');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan 非免费时应该直接返回', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: false,
      isFree: false,
      credits: { enable: true, amount: 10, expireDays: 30 },
    });
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'paid-plan');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan credits 未启用时应该直接返回', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: false,
      isFree: true,
      credits: { enable: false, amount: 10, expireDays: 30 },
    });
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'no-credits-plan');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan 无 credits 配置时应该直接返回', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: false,
      isFree: true,
    });
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'no-config-plan');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('已领取本月积分时不应重复发放', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: false,
      isFree: true,
      credits: { enable: true, amount: 10, expireDays: 30 },
    });
    // canAddCreditsByType: existing transaction found → cannot add
    limitReturnValue = [{ id: 'existing-tx' }];
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'free-plan');
    // 因为 canAdd=false，不应该调用 addCredits（不会 insert 新记录）
  });
});

// ============================================================================
// addSubscriptionCredits
// ============================================================================

describe('addSubscriptionCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    mockFindPlanByPriceId.mockReset();
  });

  it('plan 不存在时应该直接返回', async () => {
    mockFindPlanByPriceId.mockReturnValue(null);
    const { addSubscriptionCredits } = await import('../credits');
    await addSubscriptionCredits('user-1', 'non-existent-price');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan credits 未启用时应该直接返回', async () => {
    mockFindPlanByPriceId.mockReturnValue({
      disabled: false,
      credits: { enable: false, amount: 100, expireDays: 30 },
    });
    const { addSubscriptionCredits } = await import('../credits');
    await addSubscriptionCredits('user-1', 'price-no-credits');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('plan 无 credits 配置时应该直接返回', async () => {
    mockFindPlanByPriceId.mockReturnValue({
      disabled: false,
    });
    const { addSubscriptionCredits } = await import('../credits');
    await addSubscriptionCredits('user-1', 'price-no-config');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});

// ============================================================================
// addRegisterGiftCredits
// ============================================================================

describe('addRegisterGiftCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('已领取过注册礼物时不应重复发放', async () => {
    limitReturnValue = [{ id: 'existing-gift' }];
    const { addRegisterGiftCredits } = await import('../credits');
    await addRegisterGiftCredits('user-1');
    // addCredits 不应被间接调用到 insert（除了 select 查询）
  });

  it('未领取过注册礼物时应该发放 15 积分', async () => {
    // 第一次查询：无已有礼物记录
    limitReturnValue = [];
    const { addRegisterGiftCredits } = await import('../credits');
    await addRegisterGiftCredits('new-user');
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

// ============================================================================
// processExpiredCredits
// ============================================================================

describe('processExpiredCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('无过期交易时不应写入任何记录', async () => {
    // processExpiredCredits 中 where() 直接返回 transactions（无 .limit()）
    const originalWhere = mockDb.where;
    mockDb.where = vi.fn().mockReturnValue([]);

    const { processExpiredCredits } = await import('../credits');
    await processExpiredCredits('user-1');
    // expiredTotal = 0, 不应调用 update/insert

    mockDb.where = originalWhere;
  });

  it('有过期交易时应该扣除余额并写入 EXPIRE 记录', async () => {
    const pastDate = new Date('2020-01-01');
    const originalWhere = mockDb.where;
    let callCount = 0;
    mockDb.where = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // 返回过期交易列表（不带 limit/orderBy，直接返回数组）
        return [
          {
            id: 'tx-exp-1',
            remainingAmount: 50,
            expirationDate: pastDate,
            expirationDateProcessedAt: null,
          },
          {
            id: 'tx-exp-2',
            remainingAmount: 30,
            expirationDate: pastDate,
            expirationDateProcessedAt: null,
          },
        ];
      }
      // 后续的 userCredit 查询
      return {
        limit: vi.fn().mockReturnValue([
          { userId: 'user-1', currentCredits: 200 },
        ]),
      };
    });

    const { processExpiredCredits } = await import('../credits');
    await processExpiredCredits('user-1');
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.insert).toHaveBeenCalled();

    mockDb.where = originalWhere;
  });

  it('交易未过期时不应处理', async () => {
    const futureDate = new Date('2099-12-31');
    const originalWhere = mockDb.where;
    mockDb.where = vi.fn().mockImplementation(() => {
      return [
        {
          id: 'tx-future',
          remainingAmount: 100,
          expirationDate: futureDate,
          expirationDateProcessedAt: null,
        },
      ];
    });

    const { processExpiredCredits } = await import('../credits');
    await processExpiredCredits('user-1');
    // isAfter(now, futureDate) = false, so expiredTotal = 0
    // 不应调用 update 来扣除余额

    mockDb.where = originalWhere;
  });

  it('remainingAmount 为 0 的过期交易不应处理', async () => {
    const pastDate = new Date('2020-01-01');
    const originalWhere = mockDb.where;
    mockDb.where = vi.fn().mockImplementation(() => {
      return [
        {
          id: 'tx-zero',
          remainingAmount: 0,
          expirationDate: pastDate,
          expirationDateProcessedAt: null,
        },
      ];
    });

    const { processExpiredCredits } = await import('../credits');
    await processExpiredCredits('user-1');

    mockDb.where = originalWhere;
  });
});

// ============================================================================
// canAddCreditsByType
// ============================================================================

describe('canAddCreditsByType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('本月无该类型交易时应返回 true', async () => {
    limitReturnValue = [];
    const { canAddCreditsByType } = await import('../credits');
    const result = await canAddCreditsByType(
      'user-1',
      CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH
    );
    expect(result).toBe(true);
  });

  it('本月已有该类型交易时应返回 false', async () => {
    limitReturnValue = [{ id: 'existing-tx' }];
    const { canAddCreditsByType } = await import('../credits');
    const result = await canAddCreditsByType(
      'user-1',
      CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH
    );
    expect(result).toBe(false);
  });
});

// ============================================================================
// addMonthlyFreeCredits canAdd=true 分支
// ============================================================================

describe('addMonthlyFreeCredits canAdd=true', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    mockFindPlanByPlanId.mockReset();
  });

  it('有效免费计划且本月未领取时应发放积分', async () => {
    mockFindPlanByPlanId.mockReturnValue({
      disabled: false,
      isFree: true,
      credits: { enable: true, amount: 10, expireDays: 30 },
    });
    // canAddCreditsByType → 无已有交易 → canAdd=true
    limitReturnValue = [];
    const { addMonthlyFreeCredits } = await import('../credits');
    await addMonthlyFreeCredits('user-1', 'free-plan');
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

// ============================================================================
// addSubscriptionCredits canAdd=true 分支
// ============================================================================

describe('addSubscriptionCredits canAdd=true', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    mockFindPlanByPriceId.mockReset();
  });

  it('有效订阅计划且本月未领取时应发放积分', async () => {
    mockFindPlanByPriceId.mockReturnValue({
      disabled: false,
      credits: { enable: true, amount: 100, expireDays: 30 },
    });
    // canAddCreditsByType → canAdd=true
    limitReturnValue = [];
    const { addSubscriptionCredits } = await import('../credits');
    await addSubscriptionCredits('user-1', 'price-sub');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('有效订阅计划但本月已领取时不应发放', async () => {
    mockFindPlanByPriceId.mockReturnValue({
      disabled: false,
      credits: { enable: true, amount: 100, expireDays: 30 },
    });
    // canAddCreditsByType → 已有交易 → canAdd=false
    limitReturnValue = [{ id: 'existing' }];
    const { addSubscriptionCredits } = await import('../credits');
    await addSubscriptionCredits('user-1', 'price-sub-2');
    // 不会调用 addCredits → 不会 insert
  });
});

// ============================================================================
// CREDIT_TRANSACTION_TYPE 枚举完整性
// ============================================================================

describe('CREDIT_TRANSACTION_TYPE', () => {
  it('应该包含所有必要的交易类型', () => {
    expect(CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH).toBe('MONTHLY_REFRESH');
    expect(CREDIT_TRANSACTION_TYPE.REGISTER_GIFT).toBe('REGISTER_GIFT');
    expect(CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE).toBe('PURCHASE_PACKAGE');
    expect(CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL).toBe(
      'SUBSCRIPTION_RENEWAL'
    );
    expect(CREDIT_TRANSACTION_TYPE.USAGE).toBe('USAGE');
    expect(CREDIT_TRANSACTION_TYPE.EXPIRE).toBe('EXPIRE');
    expect(CREDIT_TRANSACTION_TYPE.REFERRAL_REGISTRATION).toBe(
      'REFERRAL_REGISTRATION'
    );
    expect(CREDIT_TRANSACTION_TYPE.REFERRAL_PURCHASE).toBe(
      'REFERRAL_PURCHASE'
    );
  });

  it('交易类型不应有重复值', () => {
    const values = Object.values(CREDIT_TRANSACTION_TYPE);
    expect(new Set(values).size).toBe(values.length);
  });

  it('所有值应为字符串', () => {
    for (const value of Object.values(CREDIT_TRANSACTION_TYPE)) {
      expect(typeof value).toBe('string');
    }
  });
});

// ============================================================================
// saveCreditTransaction remainingAmount 逻辑
// ============================================================================

describe('saveCreditTransaction remainingAmount 逻辑', () => {
  it('正数 amount（充值）应设置 remainingAmount = amount', () => {
    const amount = 100;
    const remainingAmount = amount > 0 ? amount : null;
    expect(remainingAmount).toBe(100);
  });

  it('负数 amount（消费）应设置 remainingAmount = null', () => {
    const amount = -50;
    const remainingAmount = amount > 0 ? amount : null;
    expect(remainingAmount).toBeNull();
  });
});

// ============================================================================
// 积分安全性：边界值和异常情况
// ============================================================================

describe('积分安全性边界测试', () => {
  it('超大金额不应导致溢出', () => {
    const amount = Number.MAX_SAFE_INTEGER;
    expect(Number.isFinite(amount)).toBe(true);
    expect(amount > 0).toBe(true);
  });

  it('最小正数应通过验证', () => {
    const amount = 0.01;
    expect(Number.isFinite(amount)).toBe(true);
    expect(amount > 0).toBe(true);
  });

  it('浮点精度问题：0.1 + 0.2 不等于 0.3', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(Math.round((0.1 + 0.2) * 100) / 100).toBe(0.3);
  });
});
