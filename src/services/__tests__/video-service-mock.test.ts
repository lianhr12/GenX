import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * VideoService 完整 mock 测试
 * 覆盖 generate、handleCallback、refreshStatus、tryComplete/tryFail、
 * getVideo、listVideos、deleteVideo、toggleFavorite、batchDelete、batchFavorite
 */

// ============================================================================
// 队列式 Mock 基础设施
// ============================================================================

let limitQueue: unknown[][] = [];
let limitIdx = 0;
let whereQueue: unknown[][] = [];
let whereIdx = 0;
let orderByLimitQueue: unknown[][] = [];
let orderByLimitIdx = 0;

function nextLimit() {
  const v = limitQueue[limitIdx] || [];
  limitIdx++;
  return v;
}
function makeWhereResult() {
  const v = whereQueue[whereIdx] || [];
  whereIdx++;
  const arr: any = [...v];
  arr.limit = vi.fn().mockImplementation(() => nextLimit());
  arr.orderBy = vi.fn().mockReturnValue({
    limit: vi.fn().mockImplementation(() => {
      const r = orderByLimitQueue[orderByLimitIdx] || [];
      orderByLimitIdx++;
      return r;
    }),
  });
  return arr;
}

function resetQueues() {
  limitQueue = [];
  limitIdx = 0;
  whereQueue = [];
  whereIdx = 0;
  orderByLimitQueue = [];
  orderByLimitIdx = 0;
}

const mockReturning = vi.fn().mockReturnValue([{ uuid: 'vid_test', id: 1 }]);

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
        returning: vi.fn().mockReturnValue([{ uuid: 'vid_test' }]),
      }),
    }),
  }),
};

vi.mock('@/db', () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  videos: {
    uuid: 'uuid',
    id: 'id',
    userId: 'userId',
    prompt: 'prompt',
    model: 'model',
    parameters: 'parameters',
    status: 'status',
    creditsUsed: 'creditsUsed',
    isPublic: 'isPublic',
    hidePrompt: 'hidePrompt',
    updatedAt: 'updatedAt',
    externalTaskId: 'externalTaskId',
    errorMessage: 'errorMessage',
    videoUrl: 'videoUrl',
    thumbnailUrl: 'thumbnailUrl',
    originalVideoUrl: 'originalVideoUrl',
    completedAt: 'completedAt',
    isFavorite: 'isFavorite',
    isDeleted: 'isDeleted',
    createdAt: 'createdAt',
    startImageUrl: 'startImageUrl',
    duration: 'duration',
    aspectRatio: 'aspectRatio',
    provider: 'provider',
  },
  user: { id: 'id', name: 'name', image: 'image' },
  creditHolds: { mediaUuid: 'mediaUuid' },
  VideoStatus: {
    PENDING: 'PENDING',
    GENERATING: 'GENERATING',
    UPLOADING: 'UPLOADING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  },
  Video: {},
}));

const mockCreateTask = vi.fn();
const mockParseCallback = vi.fn();
const mockGetTaskStatus = vi.fn();

vi.mock('@/ai/video', () => ({
  getProvider: () => ({
    createTask: mockCreateTask,
    parseCallback: mockParseCallback,
    getTaskStatus: mockGetTaskStatus,
  }),
}));

vi.mock('@/ai/video/utils/callback-signature', () => ({
  generateSignedCallbackUrl: vi
    .fn()
    .mockReturnValue('https://cb.example.com/signed'),
}));

vi.mock('@/config/video-credits', () => ({
  calculateModelCredits: vi.fn().mockReturnValue(20),
  getModelConfig: vi.fn().mockImplementation((model: string) => {
    if (model === 'unsupported') return null;
    if (model === 'no-i2v')
      return {
        provider: 'evolink',
        durations: [5, 10],
        supportImageToVideo: false,
      };
    if (model === 'exact-dims')
      return {
        provider: 'evolink',
        durations: [5],
        supportImageToVideo: true,
        imageRequirements: {
          exactDimensions: true,
          dimensions: { '16:9': { width: 1280, height: 720 } },
        },
      };
    return {
      provider: 'evolink',
      durations: [5, 10, 15],
      supportImageToVideo: true,
    };
  }),
  getAvailableModels: vi.fn().mockReturnValue([]),
}));

const mockFreezeCredits = vi
  .fn()
  .mockResolvedValue({ success: true, holdId: 1 });
const mockReleaseCredits = vi.fn().mockResolvedValue(undefined);
const mockSettleCredits = vi.fn().mockResolvedValue(undefined);

vi.mock('@/credits/server', () => ({
  freezeCredits: (...args: unknown[]) => mockFreezeCredits(...args),
  releaseCredits: (...args: unknown[]) => mockReleaseCredits(...args),
  settleCredits: (...args: unknown[]) => mockSettleCredits(...args),
}));

vi.mock('@/storage', () => ({
  getStorage: () => ({
    downloadAndUpload: vi
      .fn()
      .mockResolvedValue({ url: 'https://cdn.example.com/vid.mp4' }),
  }),
}));

vi.mock('@/actions/gallery/submit-to-gallery', () => ({
  autoSubmitToGallery: vi.fn().mockResolvedValue(undefined),
}));

// ============================================================================
// VideoService.generate
// ============================================================================

describe('VideoService.generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
    mockReturning.mockReturnValue([{ uuid: 'vid_test', id: 1 }]);
    mockFreezeCredits.mockResolvedValue({ success: true, holdId: 1 });
    mockCreateTask.mockResolvedValue({
      taskId: 'task_v_123',
      estimatedTime: 60,
    });
  });

  it('成功生成视频应返回完整结果', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.generate({
      userId: 'user-1',
      prompt: 'a cat',
      model: 'wan2.6-text-to-video',
      duration: 5,
    });
    expect(result.videoUuid).toBe('vid_test');
    expect(result.taskId).toBe('task_v_123');
    expect(result.provider).toBe('evolink');
    expect(result.status).toBe('GENERATING');
    expect(result.creditsUsed).toBe(20);
  });

  it('不支持的模型应抛出错误', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'unsupported',
        duration: 5,
      })
    ).rejects.toThrow('Unsupported model: unsupported');
  });

  it('不支持的时长应抛出错误', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 99,
      })
    ).rejects.toThrow('only supports duration');
  });

  it('不支持 I2V 的模型传入 imageUrl 应抛出错误', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'no-i2v',
        duration: 5,
        imageUrl: 'https://example.com/img.png',
      })
    ).rejects.toThrow('does not support image-to-video');
  });

  it('精确尺寸要求的模型传入 imageUrl 应抛出错误', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'exact-dims',
        duration: 5,
        imageUrl: 'https://example.com/img.png',
        aspectRatio: '16:9',
      })
    ).rejects.toThrow('Image dimensions must match');
  });

  it('insert 失败应抛出错误', async () => {
    mockReturning.mockReturnValue([]);
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
      })
    ).rejects.toThrow('Failed to create video record');
  });

  it('freezeCredits 失败应抛出错误并标记 FAILED', async () => {
    mockFreezeCredits.mockRejectedValue(new Error('Insufficient credits'));
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
      })
    ).rejects.toThrow('Insufficient credits');
    expect(mockDb.update).toHaveBeenCalled();
  });

  it('freezeCredits 返回 success=false 应抛出错误', async () => {
    mockFreezeCredits.mockResolvedValue({ success: false, holdId: 0 });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
      })
    ).rejects.toThrow('Insufficient credits');
  });

  it('AI provider createTask 失败应 release 积分并抛出错误', async () => {
    mockCreateTask.mockRejectedValue(new Error('Provider down'));
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.generate({
        userId: 'user-1',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
      })
    ).rejects.toThrow('Provider down');
    expect(mockReleaseCredits).toHaveBeenCalled();
  });
});

// ============================================================================
// VideoService.handleCallback
// ============================================================================

describe('VideoService.handleCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('视频不存在应直接返回', async () => {
    limitQueue = [[]];
    mockParseCallback.mockReturnValue({
      taskId: 'task_1',
      status: 'completed',
      videoUrl: 'x',
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.handleCallback('evolink' as any, {}, 'vid_missing');
  });

  it('task ID 不匹配应直接返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_1',
          externalTaskId: 'task_original',
          status: 'GENERATING',
          userId: 'user-1',
          id: 1,
          isPublic: true,
          provider: 'evolink',
        },
      ],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_different',
      status: 'completed',
      videoUrl: 'x',
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.handleCallback('evolink' as any, {}, 'vid_1');
  });

  it('completed callback 应触发 tryCompleteGeneration', async () => {
    limitQueue = [
      // handleCallback: find video
      [
        {
          uuid: 'vid_cb',
          externalTaskId: 'task_cb',
          status: 'GENERATING',
          userId: 'user-1',
          id: 1,
          isPublic: true,
          provider: 'evolink',
        },
      ],
      // tryCompleteGeneration: find video again
      [
        {
          uuid: 'vid_cb',
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
      videoUrl: 'https://provider.com/vid.mp4',
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.handleCallback('evolink' as any, {}, 'vid_cb');
    expect(mockSettleCredits).toHaveBeenCalledWith('vid_cb');
  });

  it('failed callback 应触发 tryFailGeneration', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_fail',
          externalTaskId: 'task_fail',
          status: 'GENERATING',
          userId: 'user-1',
          id: 2,
          isPublic: false,
          provider: 'evolink',
        },
      ],
      // tryFailGeneration: find video
      [
        {
          uuid: 'vid_fail',
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
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.handleCallback('evolink' as any, {}, 'vid_fail');
    expect(mockReleaseCredits).toHaveBeenCalledWith('vid_fail');
  });

  it('已完成视频的 callback 应提前返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_done',
          externalTaskId: 'task_done',
          status: 'GENERATING',
          userId: 'user-1',
          id: 3,
          isPublic: false,
          provider: 'evolink',
        },
      ],
      // tryCompleteGeneration: video already completed
      [{ uuid: 'vid_done', status: 'COMPLETED', videoUrl: 'u.mp4' }],
    ];
    mockParseCallback.mockReturnValue({
      taskId: 'task_done',
      status: 'completed',
      videoUrl: 'https://p.com/v.mp4',
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.handleCallback('evolink' as any, {}, 'vid_done');
    expect(mockSettleCredits).not.toHaveBeenCalled();
  });
});

// ============================================================================
// VideoService.refreshStatus
// ============================================================================

describe('VideoService.refreshStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('视频不存在应抛出 Video not found', async () => {
    limitQueue = [[]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.refreshStatus('vid_missing', 'user-1')
    ).rejects.toThrow('Video not found');
  });

  it('已完成的视频应直接返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_done',
          status: 'COMPLETED',
          videoUrl: 'https://cdn.com/vid.mp4',
          errorMessage: null,
          externalTaskId: 'task_1',
          provider: 'evolink',
        },
      ],
    ];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_done', 'user-1');
    expect(result.status).toBe('COMPLETED');
    expect(result.videoUrl).toBe('https://cdn.com/vid.mp4');
  });

  it('已失败的视频应直接返回', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_fail',
          status: 'FAILED',
          videoUrl: null,
          errorMessage: 'Timeout',
          externalTaskId: 'task_1',
          provider: 'evolink',
        },
      ],
    ];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_fail', 'user-1');
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('Timeout');
  });

  it('无 externalTaskId 的 GENERATING 视频应返回当前状态', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_no_task',
          status: 'GENERATING',
          videoUrl: null,
          errorMessage: null,
          externalTaskId: null,
          provider: null,
        },
      ],
    ];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_no_task', 'user-1');
    expect(result.status).toBe('GENERATING');
  });

  it('GENERATING + provider 返回 completed 应触发 tryComplete', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_gen',
          status: 'GENERATING',
          externalTaskId: 'task_gen',
          videoUrl: null,
          errorMessage: null,
          provider: 'evolink',
          isPublic: false,
          userId: 'user-1',
          id: 10,
        },
      ],
      // tryCompleteGeneration: find video
      [
        {
          uuid: 'vid_gen',
          status: 'GENERATING',
          isPublic: false,
          userId: 'user-1',
          id: 10,
        },
      ],
    ];
    mockGetTaskStatus.mockResolvedValue({
      status: 'completed',
      videoUrl: 'https://p.com/v.mp4',
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_gen', 'user-1');
    expect(result.status).toBe('COMPLETED');
  });

  it('GENERATING + provider 返回 failed 应触发 tryFail', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_gen2',
          status: 'GENERATING',
          externalTaskId: 'task_gen2',
          videoUrl: null,
          errorMessage: null,
          provider: 'evolink',
          isPublic: false,
          userId: 'user-1',
          id: 11,
        },
      ],
      [
        {
          uuid: 'vid_gen2',
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
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_gen2', 'user-1');
    expect(result.status).toBe('FAILED');
    expect(result.error).toBeDefined();
  });

  it('provider 查询异常应 fallback 返回当前状态', async () => {
    limitQueue = [
      [
        {
          uuid: 'vid_err',
          status: 'GENERATING',
          externalTaskId: 'task_err',
          videoUrl: null,
          errorMessage: null,
          provider: 'evolink',
        },
      ],
    ];
    mockGetTaskStatus.mockRejectedValue(new Error('network error'));
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.refreshStatus('vid_err', 'user-1');
    expect(result.status).toBe('GENERATING');
  });
});

// ============================================================================
// VideoService.getVideo
// ============================================================================

describe('VideoService.getVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('存在的视频应返回记录', async () => {
    limitQueue = [[{ uuid: 'vid_1', userId: 'user-1' }]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.getVideo('vid_1', 'user-1');
    expect(result).not.toBeNull();
  });

  it('不存在的视频应返回 null', async () => {
    limitQueue = [[]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.getVideo('vid_missing', 'user-1');
    expect(result).toBeNull();
  });
});

// ============================================================================
// VideoService.deleteVideo
// ============================================================================

describe('VideoService.deleteVideo', () => {
  it('应该调用 soft delete', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await service.deleteVideo('vid_1', 'user-1');
    expect(mockDb.update).toHaveBeenCalled();
  });
});

// ============================================================================
// VideoService.toggleFavorite
// ============================================================================

describe('VideoService.toggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('视频不存在应抛出错误', async () => {
    limitQueue = [[]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    await expect(
      service.toggleFavorite('vid_missing', 'user-1')
    ).rejects.toThrow('Video not found');
  });

  it('视频存在应切换收藏状态', async () => {
    limitQueue = [[{ isFavorite: false }]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.toggleFavorite('vid_1', 'user-1');
    expect(result).toBe(true);
  });
});

// ============================================================================
// VideoService.listVideos
// ============================================================================

describe('VideoService.listVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetQueues();
  });

  it('基本查询应返回正确结构', async () => {
    // count query → where() 直接解构
    whereQueue = [[{ count: 10 }]];
    // videos query → where().orderBy().limit()
    orderByLimitQueue = [
      [
        { uuid: 'v1', createdAt: new Date() },
        { uuid: 'v2', createdAt: new Date() },
      ],
    ];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.listVideos('user-1', { limit: 20 });
    expect(result.total).toBe(10);
    expect(result.videos).toHaveLength(2);
  });

  it('带 filter 参数应通过', async () => {
    whereQueue = [[{ count: 1 }]];
    orderByLimitQueue = [[{ uuid: 'v_fav' }]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.listVideos('user-1', {
      status: 'COMPLETED',
      isFavorite: true,
      search: 'cat',
    });
    expect(result.total).toBe(1);
  });

  it('带 cursor 分页应通过', async () => {
    whereQueue = [[{ count: 5 }]];
    // cursor video lookup
    limitQueue = [[{ createdAt: new Date('2025-06-01') }]];
    // actual videos query
    orderByLimitQueue = [[{ uuid: 'v3' }]];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.listVideos('user-1', { cursor: 'vid_cursor' });
    expect(result.total).toBe(5);
  });

  it('hasMore 时应返回 nextCursor', async () => {
    whereQueue = [[{ count: 100 }]];
    // 返回 limit+1 条 → hasMore=true
    const items = Array.from({ length: 21 }, (_, i) => ({
      uuid: `v_${i}`,
      createdAt: new Date(),
    }));
    orderByLimitQueue = [items];
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.listVideos('user-1', { limit: 20 });
    expect(result.videos).toHaveLength(20);
    expect(result.nextCursor).toBeDefined();
  });
});

// ============================================================================
// VideoService.batchDelete
// ============================================================================

describe('VideoService.batchDelete', () => {
  it('空数组应返回 0', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.batchDelete([], 'user-1');
    expect(result).toBe(0);
  });

  it('有效 uuids 应返回删除数量', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue([{ uuid: 'v1' }, { uuid: 'v2' }]),
        }),
      }),
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.batchDelete(['v1', 'v2'], 'user-1');
    expect(result).toBe(2);
    mockDb.update = originalUpdate;
  });
});

// ============================================================================
// VideoService.batchFavorite
// ============================================================================

describe('VideoService.batchFavorite', () => {
  it('空数组应返回 0', async () => {
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.batchFavorite([], 'user-1', true);
    expect(result).toBe(0);
  });

  it('有效 uuids 应返回收藏数量', async () => {
    const originalUpdate = mockDb.update;
    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockReturnValue([{ uuid: 'v1' }]),
        }),
      }),
    });
    const { VideoService } = await import('../video');
    const service = new VideoService();
    const result = await service.batchFavorite(['v1'], 'user-1', true);
    expect(result).toBe(1);
    mockDb.update = originalUpdate;
  });
});
