import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Video Generation API Route 测试
 * 测试 POST /api/v1/video/generate 的完整流程
 */

// ============================================================================
// Mocks
// ============================================================================

const mockGenerate = vi.fn();

vi.mock('@/services/video', () => ({
  videoService: {
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
// Helper
// ============================================================================

function createMockRequest(body: unknown): Request {
  return new Request('http://localhost/api/v1/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validVideoRequest = {
  prompt: 'A cat walking on the beach',
  model: 'wan2.6-text-to-video',
  duration: 5,
};

// ============================================================================
// Tests
// ============================================================================

describe('POST /api/v1/video/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('未认证时应返回 401', async () => {
    mockRequireSession.mockResolvedValue(null);
    const { POST } = await import('../route');
    const req = createMockRequest(validVideoRequest);
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('prompt 缺失应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      model: 'wan2.6-text-to-video',
      duration: 5,
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('prompt 为空字符串应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ ...validVideoRequest, prompt: '' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('prompt 超长应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      ...validVideoRequest,
      prompt: 'x'.repeat(5001),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('model 缺失应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ prompt: 'test', duration: 5 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('duration 缺失应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      prompt: 'test',
      model: 'wan2.6-text-to-video',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('duration 为 0 应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ ...validVideoRequest, duration: 0 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('duration 超过 30 应返回 400', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    const { POST } = await import('../route');
    const req = createMockRequest({ ...validVideoRequest, duration: 31 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('有效请求应返回成功', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      videoUuid: 'vid_abc123',
      taskId: 'task_v_123',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 20,
    });
    const { POST } = await import('../route');
    const req = createMockRequest(validVideoRequest);
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.videoUuid).toBe('vid_abc123');
  });

  it('带 imageUrl 的 I2V 请求应通过验证', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      videoUuid: 'vid_i2v',
      taskId: 'task_i2v',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 30,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      ...validVideoRequest,
      model: 'wan2.6-image-to-video',
      imageUrl: 'https://example.com/image.png',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: 'https://example.com/image.png',
      })
    );
  });

  it('带 audioUrl 的请求应通过验证', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      videoUuid: 'vid_audio',
      taskId: 'task_audio',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 20,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      ...validVideoRequest,
      audioUrl: 'https://example.com/audio.mp3',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });

  it('generateAudio=true 的请求应通过验证', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      videoUuid: 'vid_ga',
      taskId: 'task_ga',
      provider: 'evolink',
      status: 'GENERATING',
      creditsUsed: 20,
    });
    const { POST } = await import('../route');
    const req = createMockRequest({
      ...validVideoRequest,
      generateAudio: true,
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        generateAudio: true,
      })
    );
  });

  it('videoService.generate 抛出错误时应返回 500', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockRejectedValue(new Error('Unsupported model: fake'));
    const { POST } = await import('../route');
    const req = createMockRequest(validVideoRequest);
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Unsupported model: fake');
  });

  it('videoService.generate 抛出非 Error 对象时应返回 Unknown error', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockRejectedValue('string error');
    const { POST } = await import('../route');
    const req = createMockRequest(validVideoRequest);
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Unknown error');
  });

  it('isPublic 默认为 true', async () => {
    mockRequireSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@test.com' },
    });
    mockGenerate.mockResolvedValue({
      videoUuid: 'vid_pub',
      taskId: 'task_pub',
      status: 'GENERATING',
    });
    const { POST } = await import('../route');
    const req = createMockRequest(validVideoRequest);
    await POST(req as any);
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublic: true,
        hidePrompt: false,
      })
    );
  });
});
