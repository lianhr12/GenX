import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CREDIT_TRANSACTION_TYPE } from '../types';

/**
 * credits/server.ts 测试
 * 测试 freeze-settle-release 模式的完整生命周期
 * 以及 credit package 工具函数
 */

// ============================================================================
// Mock 数据库层
// ============================================================================

let limitReturnValue: unknown[] = [];
let selectResult: unknown[] = [];

const mockInsertReturning = vi.fn().mockImplementation(() => [{ id: 1 }]);
const mockInsertValues = vi.fn().mockReturnValue({
  returning: mockInsertReturning,
});
// 用于非 returning 的 insert（settleMediaCredits 中的 creditTransaction insert）
const mockInsertValuesNoReturn = vi.fn().mockResolvedValue(undefined);

const mockUpdateSetWhere = vi.fn().mockResolvedValue(undefined);
const mockUpdateSet = vi.fn().mockReturnValue({
  where: mockUpdateSetWhere,
});

const mockDb: Record<string, any> = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockImplementation(() => limitReturnValue),
    orderBy: vi.fn().mockImplementation(() => selectResult),
  })),
  limit: vi.fn().mockImplementation(() => limitReturnValue),
  orderBy: vi.fn().mockImplementation(() => selectResult),
  insert: vi.fn().mockImplementation(() => ({
    values: vi.fn().mockImplementation((vals: unknown) => {
      // creditHolds insert returns { returning }
      // creditTransaction insert returns void
      return {
        returning: mockInsertReturning,
      };
    }),
  })),
  update: vi.fn().mockReturnValue({
    set: mockUpdateSet,
  }),
  // Transaction support: execute callback with mockDb as the transaction context
  transaction: vi
    .fn()
    .mockImplementation(async (cb: (tx: any) => Promise<any>) => {
      return await cb(mockDb);
    }),
};

vi.mock('@/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  CreditHoldStatus: {
    HOLDING: 'HOLDING',
    SETTLED: 'SETTLED',
    RELEASED: 'RELEASED',
  },
  creditHolds: {
    id: 'id',
    userId: 'userId',
    mediaUuid: 'mediaUuid',
    mediaType: 'mediaType',
    credits: 'credits',
    status: 'status',
    packageAllocation: 'packageAllocation',
    settledAt: 'settledAt',
  },
  creditTransaction: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    amount: 'amount',
    remainingAmount: 'remainingAmount',
    expirationDate: 'expirationDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  userCredit: {
    userId: 'userId',
    currentCredits: 'currentCredits',
  },
}));

vi.mock('@/config/website', () => ({
  websiteConfig: {
    credits: {
      packages: {
        starter: {
          id: 'starter',
          name: 'Starter',
          credits: 660,
          price: 990,
          expireDays: 180,
        },
        pro: {
          id: 'pro',
          name: 'Pro',
          credits: 2660,
          price: 3990,
          expireDays: 365,
        },
      },
    },
  },
}));

// ============================================================================
// getAllCreditPackages / getCreditPackageById
// ============================================================================

describe('getAllCreditPackages', () => {
  it('应该返回所有积分包', async () => {
    const { getAllCreditPackages } = await import('../server');
    const packages = getAllCreditPackages();
    expect(packages.length).toBe(2);
  });
});

describe('getCreditPackageById', () => {
  it('已知 id 应该返回积分包', async () => {
    const { getCreditPackageById } = await import('../server');
    const pkg = getCreditPackageById('starter');
    expect(pkg).toBeDefined();
    expect(pkg!.id).toBe('starter');
  });

  it('未知 id 应该返回 undefined', async () => {
    const { getCreditPackageById } = await import('../server');
    expect(getCreditPackageById('non-existent')).toBeUndefined();
  });
});

// ============================================================================
// freezeMediaCredits
// ============================================================================

describe('freezeMediaCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    selectResult = [];
  });

  it('已存在 HOLDING 状态的 hold 应该幂等返回', async () => {
    limitReturnValue = [{ id: 42, status: 'HOLDING', mediaUuid: 'vid_123' }];
    const { freezeMediaCredits } = await import('../server');
    const result = await freezeMediaCredits({
      userId: 'user-1',
      credits: 100,
      mediaUuid: 'vid_123',
      mediaType: 'video',
    });
    expect(result.success).toBe(true);
    expect(result.holdId).toBe(42);
  });

  it('已存在非 HOLDING 状态的 hold 应该抛出错误', async () => {
    limitReturnValue = [{ id: 42, status: 'SETTLED', mediaUuid: 'vid_123' }];
    const { freezeMediaCredits } = await import('../server');
    await expect(
      freezeMediaCredits({
        userId: 'user-1',
        credits: 100,
        mediaUuid: 'vid_123',
        mediaType: 'video',
      })
    ).rejects.toThrow('Hold already processed for video: vid_123');
  });

  it('余额不足时应该抛出 Insufficient credits', async () => {
    // 第一次查询 existingHold → 无
    // 第二次查询 transactions → 余额不足
    limitReturnValue = [];
    selectResult = [{ id: 'tx-1', remainingAmount: 30, expirationDate: null }];
    const { freezeMediaCredits } = await import('../server');
    await expect(
      freezeMediaCredits({
        userId: 'user-1',
        credits: 100,
        mediaUuid: 'vid_new',
        mediaType: 'video',
      })
    ).rejects.toThrow('Insufficient credits');
  });

  it('余额充足时应该成功冻结并返回 holdId', async () => {
    limitReturnValue = [];
    selectResult = [
      { id: 'tx-1', remainingAmount: 80, expirationDate: null },
      { id: 'tx-2', remainingAmount: 50, expirationDate: null },
    ];
    // 冻结后查询 userCredit
    // 需要 mock where→limit 在后续调用中返回 userCredit
    const originalWhere = mockDb.where;
    let callCount = 0;
    mockDb.where = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // existingHold query
        return { limit: vi.fn().mockReturnValue([]) };
      }
      // transactions / userCredit queries
      return {
        limit: vi
          .fn()
          .mockReturnValue([{ userId: 'user-1', currentCredits: 200 }]),
        orderBy: vi.fn().mockReturnValue(selectResult),
      };
    });

    mockInsertReturning.mockReturnValue([{ id: 99 }]);

    const { freezeMediaCredits } = await import('../server');
    const result = await freezeMediaCredits({
      userId: 'user-1',
      credits: 100,
      mediaUuid: 'vid_new2',
      mediaType: 'video',
    });
    expect(result.success).toBe(true);
    expect(result.holdId).toBe(99);

    // 恢复
    mockDb.where = originalWhere;
  });

  it('insert hold 失败时应该抛出错误', async () => {
    limitReturnValue = [];
    selectResult = [{ id: 'tx-1', remainingAmount: 200, expirationDate: null }];
    const originalWhere = mockDb.where;
    let callCount = 0;
    mockDb.where = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return { limit: vi.fn().mockReturnValue([]) };
      }
      return {
        limit: vi
          .fn()
          .mockReturnValue([{ userId: 'user-1', currentCredits: 500 }]),
        orderBy: vi.fn().mockReturnValue(selectResult),
      };
    });

    mockInsertReturning.mockReturnValue([]);

    const { freezeMediaCredits } = await import('../server');
    await expect(
      freezeMediaCredits({
        userId: 'user-1',
        credits: 100,
        mediaUuid: 'vid_fail',
        mediaType: 'video',
      })
    ).rejects.toThrow('Failed to create credit hold');

    mockDb.where = originalWhere;
  });
});

// ============================================================================
// settleMediaCredits
// ============================================================================

describe('settleMediaCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('hold 不存在时应该抛出错误', async () => {
    limitReturnValue = [];
    const { settleMediaCredits } = await import('../server');
    await expect(settleMediaCredits('vid_missing', 'video')).rejects.toThrow(
      'Hold not found for video: vid_missing'
    );
  });

  it('已 SETTLED 的 hold 应该幂等返回', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_settled',
        credits: 100,
        status: 'SETTLED',
        packageAllocation: [],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    // 不应抛出错误
    await settleMediaCredits('vid_settled', 'video');
  });

  it('非 HOLDING 状态的 hold 应该抛出 Invalid hold status', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_released',
        credits: 100,
        status: 'RELEASED',
        packageAllocation: [],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    await expect(settleMediaCredits('vid_released', 'video')).rejects.toThrow(
      'Invalid hold status: RELEASED'
    );
  });

  it('HOLDING 状态的 hold 应该成功结算', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_ok',
        credits: 100,
        status: 'HOLDING',
        packageAllocation: [{ transactionId: 'tx-1', credits: 100 }],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    await settleMediaCredits('vid_ok', 'video');
    // 应该 update hold + insert usage transaction
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('image 类型 settle 应该生成 Image generation 描述', async () => {
    limitReturnValue = [
      {
        id: 2,
        userId: 'user-1',
        mediaUuid: 'img_ok',
        credits: 50,
        status: 'HOLDING',
        packageAllocation: [],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    await settleMediaCredits('img_ok', 'image');
    expect(mockDb.insert).toHaveBeenCalled();
  });
});

// ============================================================================
// releaseMediaCredits
// ============================================================================

describe('releaseMediaCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('hold 不存在时应该静默返回（warn）', async () => {
    limitReturnValue = [];
    const { releaseMediaCredits } = await import('../server');
    // 不应抛出错误
    await releaseMediaCredits('vid_missing', 'video');
  });

  it('已 RELEASED 的 hold 应该幂等返回', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_released',
        credits: 100,
        status: 'RELEASED',
        packageAllocation: [],
      },
    ];
    const { releaseMediaCredits } = await import('../server');
    await releaseMediaCredits('vid_released', 'video');
  });

  it('非 HOLDING 状态的 hold 应该抛出 Invalid hold status', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_settled',
        credits: 100,
        status: 'SETTLED',
        packageAllocation: [],
      },
    ];
    const { releaseMediaCredits } = await import('../server');
    await expect(releaseMediaCredits('vid_settled', 'video')).rejects.toThrow(
      'Invalid hold status: SETTLED'
    );
  });

  it('HOLDING 状态应该释放积分并恢复余额', async () => {
    const originalWhere = mockDb.where;
    let callCount = 0;
    mockDb.where = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // hold query
        return {
          limit: vi.fn().mockReturnValue([
            {
              id: 1,
              userId: 'user-1',
              mediaUuid: 'vid_release',
              credits: 100,
              status: 'HOLDING',
              packageAllocation: [
                { transactionId: 'tx-1', credits: 60 },
                { transactionId: 'tx-2', credits: 40 },
              ],
            },
          ]),
        };
      }
      // subsequent queries for transactions and userCredit
      return {
        limit: vi
          .fn()
          .mockReturnValue([
            { id: 'tx-1', remainingAmount: 10, currentCredits: 200 },
          ]),
      };
    });

    const { releaseMediaCredits } = await import('../server');
    await releaseMediaCredits('vid_release', 'video');
    expect(mockDb.update).toHaveBeenCalled();

    mockDb.where = originalWhere;
  });
});

// ============================================================================
// Image/Video 特定函数（delegate to generic）
// ============================================================================

describe('Image-specific credit functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('freezeImageCredits 应该调用 freezeMediaCredits with mediaType=image', async () => {
    limitReturnValue = [{ id: 10, status: 'HOLDING', mediaUuid: 'img_1' }];
    const { freezeImageCredits } = await import('../server');
    const result = await freezeImageCredits({
      userId: 'user-1',
      credits: 50,
      imageUuid: 'img_1',
    });
    expect(result.success).toBe(true);
  });

  it('settleImageCredits 应该调用 settleMediaCredits', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'img_settle',
        credits: 50,
        status: 'HOLDING',
        packageAllocation: [],
      },
    ];
    const { settleImageCredits } = await import('../server');
    await settleImageCredits('img_settle');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('releaseImageCredits 应该调用 releaseMediaCredits', async () => {
    limitReturnValue = [];
    const { releaseImageCredits } = await import('../server');
    await releaseImageCredits('img_missing');
    // no hold found → silent return
  });
});

describe('Video-specific credit functions (legacy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
  });

  it('freezeCredits 应该调用 freezeMediaCredits with mediaType=video', async () => {
    limitReturnValue = [{ id: 20, status: 'HOLDING', mediaUuid: 'vid_1' }];
    const { freezeCredits } = await import('../server');
    const result = await freezeCredits({
      userId: 'user-1',
      credits: 100,
      videoUuid: 'vid_1',
    });
    expect(result.success).toBe(true);
  });

  it('settleCredits 应该调用 settleMediaCredits', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_settle',
        credits: 100,
        status: 'HOLDING',
        packageAllocation: [],
      },
    ];
    const { settleCredits } = await import('../server');
    await settleCredits('vid_settle');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('releaseCredits 应该调用 releaseMediaCredits', async () => {
    limitReturnValue = [];
    const { releaseCredits } = await import('../server');
    await releaseCredits('vid_missing');
  });
});

// ============================================================================
// Freeze-Settle-Release 完整生命周期一致性
// ============================================================================

describe('Freeze-Settle-Release 生命周期', () => {
  it('freeze → settle 流程应该成立', async () => {
    // 模拟 freeze 成功
    limitReturnValue = [{ id: 1, status: 'HOLDING', mediaUuid: 'vid_lc' }];
    const { freezeCredits, settleCredits } = await import('../server');
    const freezeResult = await freezeCredits({
      userId: 'user-1',
      credits: 100,
      videoUuid: 'vid_lc',
    });
    expect(freezeResult.success).toBe(true);

    // 模拟 settle
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_lc',
        credits: 100,
        status: 'HOLDING',
        packageAllocation: [],
      },
    ];
    await settleCredits('vid_lc');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('freeze → release 流程应该成立', async () => {
    limitReturnValue = [{ id: 2, status: 'HOLDING', mediaUuid: 'vid_lr' }];
    const { freezeCredits, releaseCredits } = await import('../server');
    const freezeResult = await freezeCredits({
      userId: 'user-1',
      credits: 100,
      videoUuid: 'vid_lr',
    });
    expect(freezeResult.success).toBe(true);

    // 模拟 release - no hold found 的场景
    limitReturnValue = [];
    await releaseCredits('vid_lr');
  });

  it('settle 已 settled 的 hold 应该幂等', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_double',
        credits: 100,
        status: 'SETTLED',
        packageAllocation: [],
      },
    ];
    const { settleCredits } = await import('../server');
    // 第一次
    await settleCredits('vid_double');
    // 第二次 - 应该幂等
    await settleCredits('vid_double');
  });

  it('release 已 released 的 hold 应该幂等', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_double_r',
        credits: 100,
        status: 'RELEASED',
        packageAllocation: [],
      },
    ];
    const { releaseCredits } = await import('../server');
    await releaseCredits('vid_double_r');
    await releaseCredits('vid_double_r');
  });
});

// ============================================================================
// 事务保护验证
// ============================================================================

describe('事务保护', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limitReturnValue = [];
    selectResult = [];
  });

  it('freezeMediaCredits 应使用 db.transaction', async () => {
    // 设置余额不足以触发事务内的 throw
    limitReturnValue = [];
    selectResult = [{ id: 'tx-1', remainingAmount: 5, expirationDate: null }];
    const { freezeMediaCredits } = await import('../server');
    await expect(
      freezeMediaCredits({
        userId: 'user-1',
        credits: 100,
        mediaUuid: 'vid_tx_test',
        mediaType: 'video',
      })
    ).rejects.toThrow('Insufficient credits');
    // 确认 transaction 被调用
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
  });

  it('settleMediaCredits HOLDING 状态应使用 db.transaction', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_tx_settle',
        credits: 50,
        status: 'HOLDING',
        packageAllocation: [],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    await settleMediaCredits('vid_tx_settle', 'video');
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
  });

  it('releaseMediaCredits HOLDING 状态应使用 db.transaction', async () => {
    const originalWhere = mockDb.where;
    let callCount = 0;
    mockDb.where = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          limit: vi.fn().mockReturnValue([
            {
              id: 1,
              userId: 'user-1',
              mediaUuid: 'vid_tx_release',
              credits: 80,
              status: 'HOLDING',
              packageAllocation: [{ transactionId: 'tx-1', credits: 80 }],
            },
          ]),
        };
      }
      return {
        limit: vi
          .fn()
          .mockReturnValue([
            { id: 'tx-1', remainingAmount: 0, currentCredits: 100 },
          ]),
      };
    });

    const { releaseMediaCredits } = await import('../server');
    await releaseMediaCredits('vid_tx_release', 'video');
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);

    mockDb.where = originalWhere;
  });

  it('settleMediaCredits 已 SETTLED 不应调用 transaction', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_already_settled',
        credits: 50,
        status: 'SETTLED',
        packageAllocation: [],
      },
    ];
    const { settleMediaCredits } = await import('../server');
    await settleMediaCredits('vid_already_settled', 'video');
    // 幂等快速路径不应触发事务
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  it('releaseMediaCredits 已 RELEASED 不应调用 transaction', async () => {
    limitReturnValue = [
      {
        id: 1,
        userId: 'user-1',
        mediaUuid: 'vid_already_released',
        credits: 50,
        status: 'RELEASED',
        packageAllocation: [],
      },
    ];
    const { releaseMediaCredits } = await import('../server');
    await releaseMediaCredits('vid_already_released', 'video');
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });
});
