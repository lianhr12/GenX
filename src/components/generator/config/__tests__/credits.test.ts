import { describe, expect, it } from 'vitest';
import type { CreatorMode, GenerationParams } from '../../types';
import {
  calculateCredits,
  getCreditsRange,
  isAudioMode,
  isImageMode,
  isVideoMode,
} from '../credits';

// ============================================================================
// isVideoMode / isImageMode / isAudioMode
// ============================================================================

describe('模式分类函数', () => {
  describe('isVideoMode', () => {
    it('text-to-video 是视频模式', () => {
      expect(isVideoMode('text-to-video')).toBe(true);
    });
    it('image-to-video 是视频模式', () => {
      expect(isVideoMode('image-to-video')).toBe(true);
    });
    it('reference-to-video 是视频模式', () => {
      expect(isVideoMode('reference-to-video')).toBe(true);
    });
    it('text-to-image 不是视频模式', () => {
      expect(isVideoMode('text-to-image')).toBe(false);
    });
    it('image-to-image 不是视频模式', () => {
      expect(isVideoMode('image-to-image')).toBe(false);
    });
    it('audio 不是视频模式', () => {
      expect(isVideoMode('audio')).toBe(false);
    });
  });

  describe('isImageMode', () => {
    it('text-to-image 是图片模式', () => {
      expect(isImageMode('text-to-image')).toBe(true);
    });
    it('image-to-image 是图片模式', () => {
      expect(isImageMode('image-to-image')).toBe(true);
    });
    it('text-to-video 不是图片模式', () => {
      expect(isImageMode('text-to-video')).toBe(false);
    });
    it('audio 不是图片模式', () => {
      expect(isImageMode('audio')).toBe(false);
    });
  });

  describe('isAudioMode', () => {
    it('audio 是音频模式', () => {
      expect(isAudioMode('audio')).toBe(true);
    });
    it('text-to-video 不是音频模式', () => {
      expect(isAudioMode('text-to-video')).toBe(false);
    });
  });
});

// ============================================================================
// calculateCredits
// ============================================================================

describe('calculateCredits', () => {
  describe('视频模式积分计算', () => {
    it('text-to-video 应使用 video-credits 计算', () => {
      const params: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
        quality: '720p',
      };
      const credits = calculateCredits(params);
      expect(credits).toBeGreaterThan(0);
      expect(credits).toBe(133);
    });

    it('image-to-video 应使用 video-credits 计算', () => {
      const params: GenerationParams = {
        mode: 'image-to-video',
        prompt: 'test',
        model: 'wan2.6-image-to-video',
        duration: 5,
      };
      const credits = calculateCredits(params);
      expect(credits).toBeGreaterThan(0);
      expect(credits).toBe(146);
    });

    it('reference-to-video 应使用 video-credits 计算', () => {
      const params: GenerationParams = {
        mode: 'reference-to-video',
        prompt: 'test',
        model: 'wan2.6-reference-video',
        duration: 10,
      };
      const credits = calculateCredits(params);
      expect(credits).toBeGreaterThan(0);
    });

    it('不存在的视频模型应回退到 creditsBase', () => {
      const params: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'non-existent-video-model',
        duration: 5,
      };
      const credits = calculateCredits(params);
      expect(credits).toBe(100); // modeConfigs['text-to-video'].creditsBase
    });

    it('duration 未指定时应使用模型的第一个时长', () => {
      const params: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
      };
      const credits = calculateCredits(params);
      expect(credits).toBeGreaterThan(0);
    });
  });

  describe('图片模式积分计算', () => {
    it('text-to-image 应使用 image-credits 计算', () => {
      const params: GenerationParams = {
        mode: 'text-to-image',
        prompt: 'test',
        model: 'gpt-image-1.5',
      };
      const credits = calculateCredits(params);
      expect(credits).toBe(8);
    });

    it('image-to-image 应使用 image-credits 计算', () => {
      const params: GenerationParams = {
        mode: 'image-to-image',
        prompt: 'test',
        model: 'qwen-image-edit-plus',
      };
      const credits = calculateCredits(params);
      expect(credits).toBeGreaterThan(0);
    });

    it('outputNumber 应影响图片积分', () => {
      const single: GenerationParams = {
        mode: 'text-to-image',
        prompt: 'test',
        model: 'gpt-image-1.5',
        outputNumber: 1,
      };
      const multi: GenerationParams = {
        mode: 'text-to-image',
        prompt: 'test',
        model: 'gpt-image-1.5',
        outputNumber: 4,
      };
      expect(calculateCredits(multi)).toBe(calculateCredits(single) * 4);
    });

    it('不存在的图片模型应回退到 creditsBase * outputNumber', () => {
      const params: GenerationParams = {
        mode: 'text-to-image',
        prompt: 'test',
        model: 'non-existent-image-model',
        outputNumber: 2,
      };
      const credits = calculateCredits(params);
      expect(credits).toBe(8 * 2); // creditsBase=8, outputNumber=2
    });
  });

  describe('音频模式积分计算', () => {
    it('audio 模式应使用 creditsBase', () => {
      const params: GenerationParams = {
        mode: 'audio',
        prompt: 'test',
        model: 'audio-default',
      };
      const credits = calculateCredits(params);
      expect(credits).toBe(10);
    });
  });

  describe('积分一致性：视频高质量 > 标准质量', () => {
    it('1080p 积分应 > 720p 积分', () => {
      const standard: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
        quality: '720p',
      };
      const hq: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
        quality: '1080p',
      };
      expect(calculateCredits(hq)).toBeGreaterThan(calculateCredits(standard));
    });
  });

  describe('积分一致性：更长时长 >= 更短时长', () => {
    it('10s 积分应 >= 5s 积分', () => {
      const short: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 5,
      };
      const long: GenerationParams = {
        mode: 'text-to-video',
        prompt: 'test',
        model: 'wan2.6-text-to-video',
        duration: 10,
      };
      expect(calculateCredits(long)).toBeGreaterThanOrEqual(
        calculateCredits(short)
      );
    });
  });
});

// ============================================================================
// getCreditsRange
// ============================================================================

describe('getCreditsRange', () => {
  const allModes: CreatorMode[] = [
    'text-to-video',
    'image-to-video',
    'text-to-image',
    'image-to-image',
    'reference-to-video',
    'audio',
  ];

  for (const mode of allModes) {
    it(`${mode} 应返回有效的范围 (min <= max)`, () => {
      const range = getCreditsRange(mode);
      expect(range.min).toBeGreaterThan(0);
      expect(range.max).toBeGreaterThanOrEqual(range.min);
    });
  }

  it('视频模式的 max 应远大于 min', () => {
    const range = getCreditsRange('text-to-video');
    expect(range.max).toBeGreaterThan(range.min * 2);
  });
});
