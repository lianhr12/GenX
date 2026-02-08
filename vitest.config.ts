import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        // 纯函数/配置文件 - 可完全单元测试
        'src/config/image-credits.ts',
        'src/config/video-credits.ts',
        'src/components/generator/config/credits.ts',
        'src/components/generator/config/modes.ts',
        'src/components/generator/config/models.ts',
        'src/components/generator/config/defaults.ts',
        'src/credits/types.ts',
        // DB 依赖文件 - 参数验证部分可测试
        'src/credits/credits.ts',
        'src/credits/server.ts',
        // 服务层和 API 路由 - 需要集成测试环境
        'src/services/image.ts',
        'src/services/video.ts',
        'src/app/api/v1/image/generate/route.ts',
        'src/app/api/v1/video/generate/route.ts',
      ],
      thresholds: {
        // 纯逻辑文件已达 95%+
        // DB 依赖文件需要集成测试环境，暂不设全局阈值
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/content': resolve(__dirname, './content'),
      '@/public': resolve(__dirname, './public'),
    },
  },
});
