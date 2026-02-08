import { describe, expect, it } from 'vitest';
import {
  generateSignedImageCallbackUrl,
  verifyImageCallbackSignature,
} from '../callback-signature';

describe('Image Callback Signature', () => {
  describe('generateSignedImageCallbackUrl', () => {
    it('应生成包含 imageUuid、ts、sig 参数的 URL', () => {
      const url = generateSignedImageCallbackUrl(
        'https://example.com/callback',
        'img_abc123'
      );
      const parsed = new URL(url);
      expect(parsed.searchParams.get('imageUuid')).toBe('img_abc123');
      expect(parsed.searchParams.get('ts')).toBeTruthy();
      expect(parsed.searchParams.get('sig')).toBeTruthy();
    });
  });

  describe('verifyImageCallbackSignature', () => {
    it('有效签名应通过验证', () => {
      const url = generateSignedImageCallbackUrl(
        'https://example.com/callback',
        'img_valid'
      );
      const parsed = new URL(url);
      const result = verifyImageCallbackSignature(
        parsed.searchParams.get('imageUuid')!,
        parsed.searchParams.get('ts')!,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(true);
    });

    it('篡改的签名应验证失败', () => {
      const url = generateSignedImageCallbackUrl(
        'https://example.com/callback',
        'img_tamper'
      );
      const parsed = new URL(url);
      const result = verifyImageCallbackSignature(
        parsed.searchParams.get('imageUuid')!,
        parsed.searchParams.get('ts')!,
        'tampered_sig'
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('过期签名（超过 7200s）应验证失败', () => {
      const url = generateSignedImageCallbackUrl(
        'https://example.com/callback',
        'img_expire'
      );
      const parsed = new URL(url);
      const ts = parsed.searchParams.get('ts')!;
      const expiredTs = (Number.parseInt(ts, 10) - 7201).toString();

      const result = verifyImageCallbackSignature(
        'img_expire',
        expiredTs,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Signature expired');
    });

    it('篡改 imageUuid 应验证失败', () => {
      const url = generateSignedImageCallbackUrl(
        'https://example.com/callback',
        'img_original'
      );
      const parsed = new URL(url);
      const result = verifyImageCallbackSignature(
        'img_different',
        parsed.searchParams.get('ts')!,
        parsed.searchParams.get('sig')!
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });
});
