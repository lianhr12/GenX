# Landing Page Performance Guide

本文档提供 GenX Landing 页面性能优化的测试和验证指南。

## 性能目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 最大内容绘制，Hero 区域的主要视觉元素 |
| **FCP** (First Contentful Paint) | < 1.8s | 首次内容绘制 |
| **FID** (First Input Delay) | < 100ms | 首次输入延迟 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 累积布局偏移 |
| **TTI** (Time to Interactive) | < 3.8s | 可交互时间 |
| **TTFB** (Time to First Byte) | < 800ms | 首字节时间 |

## 测试工具

### 1. Chrome DevTools Lighthouse

最快速的本地测试方式：

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 打开 Chrome DevTools (F12)
# 3. 切换到 Lighthouse 标签
# 4. 选择 "Performance" 类别
# 5. 点击 "Analyze page load"
```

**注意**：开发环境的性能不代表生产环境，建议在构建后测试：

```bash
# 构建并启动生产服务器
pnpm build && pnpm start
```

### 2. PageSpeed Insights (线上)

访问 [PageSpeed Insights](https://pagespeed.web.dev/) 输入你的部署 URL。

### 3. WebPageTest (详细分析)

访问 [WebPageTest](https://www.webpagetest.org/) 进行更详细的性能分析。

推荐设置：
- Test Location: 选择目标用户所在区域
- Browser: Chrome
- Connection: 4G / Fast 3G (模拟真实用户网络)
- Number of Tests: 3 (取平均值)

### 4. 代码中添加监控

在开发时启用 Web Vitals 监控：

```tsx
// src/app/[locale]/layout.tsx
'use client';

import { useEffect } from 'react';
import { initWebVitals, debugLCP } from '@/lib/performance';

export function PerformanceMonitor() {
  useEffect(() => {
    // 初始化 Web Vitals 监控
    initWebVitals();
    
    // 开发环境下调试 LCP
    if (process.env.NODE_ENV === 'development') {
      debugLCP();
    }
  }, []);

  return null;
}
```

## 优化检查清单

### Hero Section (LCP 关键区域)

- [ ] 只渲染当前播放的视频（不是所有 5 个）
- [ ] Poster 图片使用 `<Image priority />` 加载
- [ ] 视频使用 `preload="auto"` 仅对首个视频
- [ ] 预加载下一个视频
- [ ] 使用 WebM + MP4 双格式

### 图片优化

- [ ] 所有图片使用 Next.js `<Image>` 组件
- [ ] 非首屏图片使用 `loading="lazy"`
- [ ] 设置正确的 `sizes` 属性
- [ ] 启用 AVIF/WebP 格式转换

### 视频优化

- [ ] 视频使用 WebM (VP9) + MP4 (H.264) 双格式
- [ ] 非首屏视频使用 `preload="none"`
- [ ] 视频时长控制在 3-5 秒
- [ ] 视频分辨率不超过 1920x1080
- [ ] 使用媒体优化脚本处理视频

```bash
# 运行媒体优化脚本
./scripts/optimize-media.sh all
```

### 代码分割

- [ ] Hero Section 静态导入
- [ ] 非首屏组件使用 `next/dynamic`
- [ ] 保持 SSR 以支持 SEO
- [ ] 添加 loading skeleton

### 资源预加载

- [ ] Hero poster 图片 preload
- [ ] CDN preconnect
- [ ] 关键字体 preload

## 常见问题排查

### LCP 过慢

1. **检查 LCP 元素**：
   ```tsx
   import { debugLCP } from '@/lib/performance';
   debugLCP(); // 在控制台查看 LCP 元素
   ```

2. **检查网络瀑布图**：Chrome DevTools > Network > 查看资源加载顺序

3. **常见原因**：
   - 视频文件过大
   - 图片未优化
   - 服务器响应慢 (TTFB)
   - 渲染阻塞资源

### CLS 过高

1. **检查布局偏移**：Chrome DevTools > Lighthouse > 查看 CLS 详情

2. **常见原因**：
   - 图片未设置尺寸
   - 动态内容插入
   - 字体加载导致文本跳动
   - 广告/iframe 加载

### FID/INP 过慢

1. **检查长任务**：Chrome DevTools > Performance > 查看 Long Tasks

2. **常见原因**：
   - JavaScript 执行时间过长
   - 主线程阻塞
   - 大量同步操作

## 性能预算

建议设置以下性能预算：

| 资源类型 | 预算 |
|----------|------|
| JavaScript (压缩后) | < 300KB |
| CSS (压缩后) | < 50KB |
| 首屏图片总大小 | < 500KB |
| Hero 视频 (WebM) | < 2MB |
| 字体文件 | < 100KB |

## 持续监控

### 生产环境监控

推荐使用以下服务进行持续监控：

1. **Vercel Analytics** - 如果部署在 Vercel
2. **Google Search Console** - Core Web Vitals 报告
3. **SpeedCurve** - 持续性能监控
4. **Calibre** - 性能预算监控

### GitHub Actions CI 检测

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install && npm run build
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          budgetPath: ./lighthouse-budget.json
```

## 资源

- [web.dev Core Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
