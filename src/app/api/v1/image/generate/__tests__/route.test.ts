import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Image Generation API Route 测试
 * 测试 POST /api/v1/image/generate 的完整流程
 */

// ============================================================================
// Mocks
// ============================================================================

const mockGenerate = vi.fn();

vi.mock('@/services/image', () => ({
  imageService: {
    generate: (...args: unknown[]) => mockGenerate(...args),
  },
}));

const mockRequireSession = vi.fn();

vi.mock('@/lib/require-session', () => ({
  requireSession: (...args: unknown[]) => mockRequireSession(...args),
  unauthorizedResponse: () =>
    new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
}));

vi.mock('server-only', () => ({}));

// ============================================================================
// Helper: 创建 NextRequest mock
// ============================================================================

function createMockRequest(body: unknown): Request {
  return new Request('http://localhost/api/v1/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('POST /api/v1/image/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未认证时应返回 401', async () => {
    mockRequireSession.mockResolvedValue(null);
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test' });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('无效请求参数应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    // prompt 缺失
    const req = createMockRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid request parameters');
  });

  it('prompt 为空字符串应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: '' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('prompt 超长应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'a'.repeat(2001) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('numberOfImages 超出范围应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test', numberOfImages: 10 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('无效 aspectRatio 应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      aspectRatio: '2:1',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('无效 quality 应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      quality: 'ultra',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('有效请求应返回成功', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_abc123',
      taskId: 'task_123',
      provider: 'evolink',
      status: 'GENERATING',
      progress: 0,
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'a cute cat' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.imageUuid).toBe('img_abc123');
    expect(data.data.taskId).toBe('task_123');
  });

  it('指定 model 和 aspectRatio 应正确传参', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_def',
      taskId: 'task_456',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 10,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      model: 'doubao-seedream-4.5',
      aspectRatio: '16:9',
      quality: 'high',
      numberOfImages: 2,
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    // 检查 generate 被正确调用
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        prompt: 'test',
        model: 'doubao-seedream-4.5',
        quality: 'high',
        numberOfImages: 2,
      })
    );
  });

  it('GPT 模型 16:9 应 fallback 到 3:2', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_gpt',
      taskId: 'task_gpt',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      model: 'gpt-image-1.5',
      aspectRatio: '16:9',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    // size should be '3:2' (fallback)
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        size: '3:2',
      })
    );
  });

  it('未知 model 应 fallback 到 gpt-image-1.5', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_fallback',
      taskId: 'task_fallback',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      model: 'unknown-model',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-image-1.5',
      })
    );
  });

  it('不传 model 时应默认 gpt-image-1.5', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_default',
      taskId: 'task_default',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-image-1.5',
      })
    );
  });

  it('imageService.generate 抛出错误时应返回 500', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockRejectedValue(new Error('Insufficient credits'));
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test' });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Insufficient credits');
  });

  it('imageService.generate 抛出非 Error 对象时应返回通用错误', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockRejectedValue('string error');
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test' });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to generate image');
  });

  it('有效 imageUrls 应通过验证', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_urls',
      taskId: 'task_urls',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'edit this image',
      imageUrls: ['https://example.com/img.png'],
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });

  it('超过 5 个 imageUrls 应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'edit',
      imageUrls: [
        'https://a.com/1.png',
        'https://a.com/2.png',
        'https://a.com/3.png',
        'https://a.com/4.png',
        'https://a.com/5.png',
        'https://a.com/6.png',
      ],
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('isPublic 和 hidePrompt 默认值应正确', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      imageUuid: 'img_defaults',
      taskId: 'task_defaults',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 8,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test' });
    await POST(req as any);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublic: true,
        hidePrompt: false,
      })
    );
  });
});
