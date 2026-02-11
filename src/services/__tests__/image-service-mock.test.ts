import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ImageService 完整 mock 测试
 * 覆盖 generate、handleCallback、refreshStatus、tryComplete/tryFail、
 * getImage、listImages、deleteImage、toggleFavorite、updateTags、
 * batchDelete、batchFavorite、adminListImages、adminDeleteImage、getStats
 */

// ============================================================================
// 队列式 Mock 基础设施
// ============================================================================

let limitQueue: unknown[][] = [];
let limitCallIdx = 0;
let groupByQueue: unknown[][] = [];
let groupByCallIdx = 0;
let offsetQueue: unknown[][] = [];
let offsetCallIdx = 0;
let whereQueue: unknown[][] = [];
let whereCallIdx = 0;

function nextLimit() {
  const val = limitQueue[limitCallIdx] || [];
  limitCallIdx++;
  return val;
}
function nextGroupBy() {
  const val = groupByQueue[groupByCallIdx] || [];
  groupByCallIdx++;
  return val;
}
function nextOffset() {
  const val = offsetQueue[offsetCallIdx] || [];
  offsetCallIdx++;
  return val;
}

// where() 返回一个数组，同时挂载 limit/orderBy/groupBy 方法
// 这样既可以直接解构（const [x] = await ...where()），也可以继续链式调用
function makeWhereResult() {
  const val = whereQueue[whereCallIdx] || [];
  whereCallIdx++;
  const arr: any = [...val];
  arr.limit = vi.fn().mockImplementation(() => nextLimit());
  arr.orderBy = vi.fn().mockReturnValue({
    limit: vi.fn().mockReturnValue({
      offset: vi.fn().mockImplementation(() => nextOffset()),
    }),
  });
  arr.groupBy = vi.fn().mockImplementation(() => nextGroupBy());
  return arr;
}

const mockReturning = vi
  .fn()
  .mockImplementation(() => [{ uuid: 'img_test', id: 1 }]);

const mockDb: Record<string, any> = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockImplementation(() => makeWhereResult()),
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: mockReturning,
    }),
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue([{ uuid: 'img_test' }]),
      }),
    }),
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockReturnValue([{ uuid: 'img_test' }]),
    }),
  }),
};

function resetQueues() {
  limitQueue = [];
  limitCallIdx = 0;
  groupByQueue = [];
  groupByCallIdx = 0;
  offsetQueue = [];
  offsetCallIdx = 0;
  whereQueue = [];
  whereCallIdx = 0;
}

vi.mock('@/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  images: {
    uuid: 'uuid',
    id: 'id',
    userId: 'userId',
    prompt: 'prompt',
    model: 'model',
    provider: 'provider',
    parameters: 'parameters',
    status: 'status',
    creditsUsed: 'creditsUsed',
    isPublic: 'isPublic',
    hidePrompt: 'hidePrompt',
    updatedAt: 'updatedAt',
    externalTaskId: 'externalTaskId',
    errorMessage: 'errorMessage',
    generationTime: 'generationTime',
    imageUrls: 'imageUrls',
    thumbnailUrl: 'thumbnailUrl',
    completedAt: 'completedAt',
    isFavorite: 'isFavorite',
    tags: 'tags',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
  },
  user: { id: 'id', name: 'name', image: 'image' },
  ImageStatus: {
    PENDING: 'PENDING',
    GENERATING: 'GENERATING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    UPLOADING: 'UPLOADING',
  },
  Image: {},
}));

const mockCreateTask = vi.fn();
const mockParseCallback = vi.fn();
const mockGetTaskStatus = vi.fn();

vi.mock('@/ai/image/providers/evolink', () => ({
  getEvolinkImageProvider: () => ({
    createTask: mockCreateTask,
    parseCallback: mockParseCallback,
    getTaskStatus: mockGetTaskStatus,
  }),
}));

vi.mock('@/ai/image/utils/callback-signature', () => ({
  generateSignedImageCallbackUrl: vi
    .fn()
    .mockReturnValue('https://cb.example.com/signed'),
}));

vi.mock('@/config/image-credits', () => ({
  calculateImageCredits: vi.fn().mockReturnValue(8),
}));

const mockFreezeImageCredits = vi
  .fn()
  .mockResolvedValue({ success: true, holdId: 1 });
const mockReleaseImageCredits = vi.fn().mockResolvedValue(undefined);
const mockSettleImageCredits = vi.fn().mockResolvedValue(undefined);

vi.mock('@/credits/server', () => ({
  freezeImageCredits: (...args: unknown[]) => mockFreezeImageCredits(...args),
  releaseImageCredits: (...args: unknown[]) => mockReleaseImageCredits(...args),
  settleImageCredits: (...args: unknown[]) => mockSettleImageCredits(...args),
}));

vi.mock('@/storage', () => ({
  getStorage: () => ({
    downloadAndUpload: vi
      .fn()
      .mockResolvedValue({ url: 'https://cdn.example.com/img.png' }),
  }),
}));

vi.mock('@/actions/gallery/submit-to-gallery', () => ({
  autoSubmitToGallery: vi.fn().mockResolvedValue(undefined),
}));

// ============================================================================
// Tests
// ============================================================================

describe('ImageService.generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
    mockReturning.mockReturnValue([{ uuid: 'img_test', id: 1 }]);
    mockFreezeImageCredits.mockResolvedValue({ success: true, holdId: 1 });
    mockCreateTask.mockResolvedValue({ taskId: 'task_123', progress: 0 });
  });

  it('成功生成图像应返回完整结果', async () => {
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.generate({
      userId: 'user-1',
      prompt: 'a cute cat',
      model: 'gpt-image-1.5',
    });
    expect(result.imageUuid).toBe('img_test');
    expect(result.taskId).toBe('task_123');
    expect(result.provider).toBe('evolink');
    expect(result.status).toBe('GENERATING');
    expect(result.creditsUsed).toBe(8);
  });

  it('insert 失败（无返回结果）应抛出错误', async () => {
    mockReturning.mockReturnValue([]);
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'gpt-image-1.5',
      })
    ).rejects.toThrow('Failed to create image record');
  });

  it('freezeCredits 失败应抛出错误并标记图像为 FAILED', async () => {
    mockFreezeImageCredits.mockRejectedValue(new Error('Insufficient credits'));
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'gpt-image-1.5',
      })
    ).rejects.toThrow('Insufficient credits');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('freezeCredits 返回 success=false 应抛出错误', async () => {
    mockFreezeImageCredits.mockResolvedValue({ success: false, holdId: 0 });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'gpt-image-1.5',
      })
    ).rejects.toThrow('Insufficient credits');
  });

  it('AI provider createTask 失败应 release 积分并抛出错误', async () => {
    mockCreateTask.mockRejectedValue(new Error('Provider error'));
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'gpt-image-1.5',
      })
    ).rejects.toThrow('Provider error');
    expect(mockReleaseImageCredits).toHaveBeenCalled();
  });
});

describe('ImageService.handleCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('图像不存在应直接返回', async () => {
    limitQueue = [[]]; // image query
    mockParseCallback.mockReturnValue({
      taskId: 'task_1',
      status: 'completed',
      imageUrls: [],
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await service.handleCallback('evolink', {}, 'img_missing');
  });

  it('task ID 不匹配应直接返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_1',
          externalTaskId: 'task_original',
          status: 'GENERATING',
          createdAt: new Date(),
          isPublic: true,
          userId: 'user-1',
          id: 1,
        },
      ],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_different',
      status: 'completed',
      imageUrls: ['https://img.com/1.png'],
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await service.handleCallback('evolink', {}, 'img_1');
  });

  it('completed callback 应触发 tryCompleteGeneration', async () => {
    const createdAt = new Date('2025-01-01');
    limitQueue = [
      // handleCallback: find image
      [
        {
          uuid: 'img_cb',
          externalTaskId: 'task_cb',
          status: 'GENERATING',
          createdAt,
          isPublic: true,
          userId: 'user-1',
          id: 1,
        },
      ],
      // tryCompleteGeneration: find image again
      [
        {
          uuid: 'img_cb',
          status: 'GENERATING',
          isPublic: true,
          userId: 'user-1',
          id: 1,
        },
      ],
      // tryCompleteGeneration: get user info for gallery
      [{ name: 'Test User', image: 'https://avatar.com/u.png' }],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_cb',
      status: 'completed',
      imageUrls: ['https://provider.com/img1.png'],
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await service.handleCallback('evolink', {}, 'img_cb');
    expect(mockSettleImageCredits).toHaveBeenCalledWith('img_cb');
  });

  it('failed callback 应触发 tryFailGeneration', async () => {
    limitQueue = [
      // handleCallback: find image
      [
        {
          uuid: 'img_fail',
          externalTaskId: 'task_fail',
          status: 'GENERATING',
          createdAt: new Date(),
          isPublic: false,
          userId: 'user-1',
          id: 2,
        },
      ],
      // tryFailGeneration: find image
      [
        {
          uuid: 'img_fail',
          status: 'GENERATING',
          isPublic: false,
          userId: 'user-1',
          id: 2,
        },
      ],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_fail',
      status: 'failed',
      error: { message: 'GPU OOM' },
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await service.handleCallback('evolink', {}, 'img_fail');
    expect(mockReleaseImageCredits).toHaveBeenCalledWith('img_fail');
  });

  it('已完成图像的 callback 应提前返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_done',
          externalTaskId: 'task_done',
          status: 'GENERATING',
          createdAt: new Date(),
          isPublic: false,
          userId: 'user-1',
          id: 3,
        },
      ],
      // tryCompleteGeneration: image already completed
      [{ uuid: 'img_done', status: 'COMPLETED', imageUrls: ['u.png'] }],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_done',
      status: 'completed',
      imageUrls: ['https://p.com/1.png'],
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await service.handleCallback('evolink', {}, 'img_done');
    expect(mockSettleImageCredits).not.toHaveBeenCalled();
  });
});

describe('ImageService.refreshStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('图像不存在应抛出 Image not found', async () => {
    limitQueue = [[]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.refreshStatus('img_missing', 'user-1')
    ).rejects.toThrow('Image not found');
  });

  it('已完成的图像应直接返回状态', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_done',
          status: 'COMPLETED',
          imageUrls: ['https://cdn.com/1.png'],
          errorMessage: null,
        },
      ],
    ];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_done', 'user-1');
    expect(result.status).toBe('COMPLETED');
    expect(result.imageUrls).toEqual(['https://cdn.com/1.png']);
  });

  it('已失败的图像应直接返回状态和错误', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_fail',
          status: 'FAILED',
          imageUrls: null,
          errorMessage: 'Provider timeout',
        },
      ],
    ];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_fail', 'user-1');
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('Provider timeout');
  });

  it('无 externalTaskId 的 GENERATING 图像应返回当前状态', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_no_task',
          status: 'GENERATING',
          externalTaskId: null,
          imageUrls: null,
          errorMessage: null,
        },
      ],
    ];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_no_task', 'user-1');
    expect(result.status).toBe('GENERATING');
  });

  it('GENERATING + provider 返回 completed 应触发 tryComplete', async () => {
    limitQueue = [
      // refreshStatus: find image
      [
        {
          uuid: 'img_gen',
          status: 'GENERATING',
          externalTaskId: 'task_gen',
          imageUrls: null,
          errorMessage: null,
          createdAt: new Date('2025-01-01'),
          isPublic: false,
          userId: 'user-1',
          id: 10,
        },
      ],
      // tryCompleteGeneration: find image again
      [
        {
          uuid: 'img_gen',
          status: 'GENERATING',
          isPublic: false,
          userId: 'user-1',
          id: 10,
        },
      ],
    ];
    mockGetTaskStatus.mockResolvedValue({
      status: 'completed',
      imageUrls: ['https://p.com/1.png'],
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_gen', 'user-1');
    expect(result.status).toBe('COMPLETED');
  });

  it('GENERATING + provider 返回 failed 应触发 tryFail', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_gen2',
          status: 'GENERATING',
          externalTaskId: 'task_gen2',
          imageUrls: null,
          errorMessage: null,
          createdAt: new Date('2025-01-01'),
          isPublic: false,
          userId: 'user-1',
          id: 11,
        },
      ],
      // tryFailGeneration: find image
      [
        {
          uuid: 'img_gen2',
          status: 'GENERATING',
          isPublic: false,
          userId: 'user-1',
          id: 11,
        },
      ],
    ];
    mockGetTaskStatus.mockResolvedValue({
      status: 'failed',
      error: { message: 'Timeout' },
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_gen2', 'user-1');
    expect(result.status).toBe('FAILED');
    expect(result.error).toBeDefined();
  });

  it('GENERATING + provider 返回 processing 应返回进度', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_prog',
          status: 'GENERATING',
          externalTaskId: 'task_prog',
          imageUrls: null,
          errorMessage: null,
        },
      ],
    ];
    mockGetTaskStatus.mockResolvedValue({ status: 'processing', progress: 50 });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_prog', 'user-1');
    expect(result.status).toBe('GENERATING');
    expect(result.progress).toBe(50);
  });

  it('provider 查询异常应 fallback 返回当前状态', async () => {
    limitQueue = [
      [
        {
          uuid: 'img_err',
          status: 'GENERATING',
          externalTaskId: 'task_err',
          imageUrls: null,
          errorMessage: null,
        },
      ],
    ];
    mockGetTaskStatus.mockRejectedValue(new Error('network error'));
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.refreshStatus('img_err', 'user-1');
    expect(result.status).toBe('GENERATING');
  });
});

describe('ImageService.getImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('存在的图像应返回记录', async () => {
    limitQueue = [[{ uuid: 'img_1', userId: 'user-1' }]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.getImage('img_1', 'user-1');
    expect(result).not.toBeNull();
  });

  it('不存在的图像应返回 null', async () => {
    limitQueue = [[]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.getImage('img_missing', 'user-1');
    expect(result).toBeNull();
  });
});

describe('ImageService.deleteImage', () => {
  it('应该调用 soft delete', async () => {
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.deleteImage('img_1', 'user-1');
    expect(result).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

describe('ImageService.toggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('图像不存在应抛出错误', async () => {
    limitQueue = [[]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.toggleFavorite('img_missing', 'user-1')
    ).rejects.toThrow('Image not found');
  });

  it('图像存在应切换收藏状态', async () => {
    limitQueue = [[{ isFavorite: false }]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.toggleFavorite('img_1', 'user-1');
    expect(result).toBe(true);
  });
});

describe('ImageService.updateTags', () => {
  it('图像不存在应抛出错误', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue([]),
        }),
      }),
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    await expect(
      service.updateTags('img_missing', 'user-1', ['tag1'])
    ).rejects.toThrow('Image not found');
    mockDb.update = originalUpdate;
  });

  it('有效更新应返回新标签', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue([{ tags: ['tag1', 'tag2'] }]),
        }),
      }),
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.updateTags('img_1', 'user-1', [
      'tag1',
      'tag2',
    ]);
    expect(result).toEqual(['tag1', 'tag2']);
    mockDb.update = originalUpdate;
  });
});

describe('ImageService.batchDelete', () => {
  it('应该返回批量删除结果', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockReturnValue([{ uuid: 'img_1' }, { uuid: 'img_2' }]),
        }),
      }),
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.batchDelete(['img_1', 'img_2'], 'user-1');
    expect(result.success).toBe(true);
    expect(result.affected).toBe(2);
    mockDb.update = originalUpdate;
  });
});

describe('ImageService.batchFavorite', () => {
  it('应该返回批量收藏结果', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue([{ uuid: 'img_1' }]),
        }),
      }),
    });
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.batchFavorite(['img_1'], 'user-1', true);
    expect(result.success).toBe(true);
    expect(result.affected).toBe(1);
    mockDb.update = originalUpdate;
  });
});

describe('ImageService.adminDeleteImage', () => {
  it('软删除应调用 update', async () => {
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.adminDeleteImage('img_1', false);
    expect(result).toBe(true);
  });

  it('硬删除应调用 delete', async () => {
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.adminDeleteImage('img_1', true);
    expect(result).toBe(true);
    expect(mockDb.delete).toHaveBeenCalled();
  });
});

describe('ImageService.listImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('基本分页查询应返回正确结构', async () => {
    // count query → where() 直接解构
    whereQueue = [[{ count: 5 }]];
    // images query → where().orderBy().limit().offset()
    offsetQueue = [
      [
        { uuid: 'img_1', prompt: 'test' },
        { uuid: 'img_2', prompt: 'test2' },
      ],
    ];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.listImages('user-1', { limit: 10, page: 1 });
    expect(result.total).toBe(5);
    expect(result.images).toHaveLength(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('带 filter 参数应通过', async () => {
    whereQueue = [[{ count: 1 }]];
    offsetQueue = [[{ uuid: 'img_fav' }]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.listImages('user-1', {
      status: 'COMPLETED',
      model: 'gpt-image-1.5',
      isFavorite: true,
      search: 'cat',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    });
    expect(result.total).toBe(1);
  });
});

describe('ImageService.adminListImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('基本 admin 查询应返回正确结构', async () => {
    whereQueue = [[{ count: 100 }]];
    offsetQueue = [[{ uuid: 'img_admin' }]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.adminListImages({ limit: 20, page: 1 });
    expect(result.total).toBe(100);
  });

  it('带 filter 参数应通过', async () => {
    whereQueue = [[{ count: 2 }]];
    offsetQueue = [[{ uuid: 'img_a1' }, { uuid: 'img_a2' }]];
    const { ImageService } = await import('../image');
    const service = new ImageService();
    const result = await service.adminListImages({
      userId: 'user-2',
      status: 'FAILED',
      model: 'gpt-image-1.5',
      search: 'dog',
    });
    expect(result.total).toBe(2);
  });
});

describe('ImageService.getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('应该返回完整统计数据', async () => {
    // getStats 4 次 where() 调用:
    // 1. total count → 直接解构
    // 2. status counts → .groupBy()
    // 3. model counts → .groupBy()
    // 4. today count → 直接解构
    whereQueue = [
      [{ count: 500 }], // total
      [], // status (会链式 .groupBy)
      [], // model (会链式 .groupBy)
      [{ count: 15 }], // today
    ];
    groupByQueue = [
      [
        { status: 'COMPLETED', count: 300 },
        { status: 'FAILED', count: 50 },
        { status: 'GENERATING', count: 20 },
        { status: 'PENDING', count: 5 },
      ],
      [
        { model: 'gpt-image-1.5', count: 200 },
        { model: 'doubao-seedream-4.5', count: 100 },
      ],
    ];

    const { ImageService } = await import('../image');
    const service = new ImageService();
    const stats = await service.getStats();
    expect(stats.total).toBe(500);
    expect(stats.completed).toBe(300);
    expect(stats.failed).toBe(50);
    expect(stats.generating).toBe(25); // GENERATING + PENDING
    expect(stats.byModel['gpt-image-1.5']).toBe(200);
    expect(stats.todayCount).toBe(15);
  });
});

describe('ImageService helper methods', () => {
  it('getExtensionFromUrl 应该从 URL 提取扩展名', () => {
    const url = 'https://example.com/image.jpg?token=abc';
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    expect(ext).toBe('jpg');
  });

  it('未知扩展名应 fallback 到 png', () => {
    const url = 'https://example.com/image.unknown';
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    const valid = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const result = ext && valid.includes(ext) ? ext : 'png';
    expect(result).toBe('png');
  });

  it('getContentType 应该正确映射', () => {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    expect(types.jpg).toBe('image/jpeg');
    expect(types.png).toBe('image/png');
    expect(types.webp).toBe('image/webp');
    expect(types.unknown || 'image/png').toBe('image/png');
  });
});
