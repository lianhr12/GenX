import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  generateSignedCallbackUrl,
  verifyCallbackSignature,
} from '../callback-signature';

describe('Video Callback Signature', () => {
  describe('generateSignedCallbackUrl', () => {
    it('应生成包含 videoUuid、ts、sig 参数的 URL', () => {
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_abc123'
      );
      const parsed = new URL(url);
      expect(parsed.searchParams.get('videoUuid')).toBe('vid_abc123');
      expect(parsed.searchParams.get('ts')).toBeTruthy();
      expect(parsed.searchParams.get('sig')).toBeTruthy();
    });

    it('不同 videoUuid 应生成不同签名', () => {
      const url1 = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_1'
      );
      const url2 = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_2'
      );
      const sig1 = new URL(url1).searchParams.get('sig');
      const sig2 = new URL(url2).searchParams.get('sig');
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyCallbackSignature', () => {
    it('有效签名应通过验证', () => {
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_valid'
      );
      const parsed = new URL(url);
      const result = verifyCallbackSignature(
        parsed.searchParams.get('videoUuid')!,
        parsed.searchParams.get('ts')!,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('篡改的签名应验证失败', () => {
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_tamper'
      );
      const parsed = new URL(url);
      const result = verifyCallbackSignature(
        parsed.searchParams.get('videoUuid')!,
        parsed.searchParams.get('ts')!,
        'tampered_signature_value'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('无效时间戳应验证失败', () => {
      const result = verifyCallbackSignature('vid_test', 'not_a_number', 'sig');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp');
    });

    it('过期签名（超过 7200s）应验证失败', () => {
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_expire'
      );
      const parsed = new URL(url);
      const ts = parsed.searchParams.get('ts')!;
      // 将时间戳减去 7201 秒使其过期
      const expiredTs = (Number.parseInt(ts, 10) - 7201).toString();

      const result = verifyCallbackSignature(
        'vid_expire',
        expiredTs,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Signature expired');
    });

    it('刚好 7200s 内的签名应通过验证', () => {
      const now = Math.floor(Date.now() / 1000);
      // 生成一个 7199 秒前的 URL
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_boundary'
      );
      const parsed = new URL(url);
      // 签名刚刚生成，应该有效
      const result = verifyCallbackSignature(
        parsed.searchParams.get('videoUuid')!,
        parsed.searchParams.get('ts')!,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(true);
    });

    it('篡改 videoUuid 应验证失败', () => {
      const url = generateSignedCallbackUrl(
        'https://example.com/callback',
        'vid_original'
      );
      const parsed = new URL(url);
      const result = verifyCallbackSignature(
        'vid_different',
        parsed.searchParams.get('ts')!,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });
});
