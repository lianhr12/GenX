# 视频生成模型 API 完整归类和功能分类文档

## 一、按厂商/模型系列分类

### 1. Veo 系列（Google）
- **veo-3.1-fast** (Veo3.1FastLite.md)
  - 功能：文生视频(T2V) + 首帧图生视频(I2V)
  - 特点：快速生成，支持多种分辨率和时长

- **veo-3.1-generate-preview** (ven3.1fast.md, ven3pro.md)
  - 功能：文生视频(T2V) + 首帧图生视频(I2V)
  - 特点：预览版本，支持多种分辨率

- **veo3.1-pro** (ven3.1prolite.md)
  - 功能：文生视频(T2V) + 首尾帧图生视频(FLF)
  - 特点：专业版本，支持首尾帧模式

### 2. Seedance 系列（字节跳动）
- **doubao-seedance-1.0-pro-fast** (seedance1.0profast.md)
  - 功能：文生视频(T2V) + 图生视频(I2V)
  - 特点：快速生成，支持2-12秒时长，多种分辨率(480p/720p/1080p)

- **seedance-1.5-pro** (Seedance1.5Pro.md)
  - 功能：文生视频(T2V) + 图生视频(I2V) + 首尾帧(FLF)
  - 特点：专业版本，支持三种生成模式

### 3. Hailuo 系列（MiniMax）
- **MiniMax-Hailuo-02** (hailuo02.md)
  - 功能：文生视频(T2V) + 图生视频(I2V) + 首尾帧(FLF)
  - 特点：全功能模型，支持512P分辨率，15种相机运动指令

- **MiniMax-Hailuo-2.3** (hailuo2.3standard.md)
  - 功能：文生视频(T2V) + 图生视频(I2V)
  - 特点：SOTA指令跟随能力，高质量输出

- **MiniMax-Hailuo-2.3-Fast** (hailuo2.3fast.md)
  - 功能：图生视频(I2V)
  - 特点：最快生成速度，极致物理效果

### 4. Sora 系列（OpenAI）
- **sora-2-preview** (Sora2API.md)
  - 功能：文生视频(T2V) + 图生视频(I2V)
  - 特点：严格内容审核，支持多种分辨率和时长

- **sora-2-pro** (sora2pro.md)
  - 功能：文生视频(T2V) + 图生视频(I2V)
  - 特点：专业版本，严格内容审核

### 5. Kling 系列（快手）
- **kling-o1-video-edit** (kling01videoedit.md)
  - 功能：视频编辑
  - 特点：支持视频编辑功能

- **kling-o1-video-edit-fast** (kling01videoeditfast.md)
  - 功能：视频编辑
  - 特点：快速视频编辑

- **kling-o1-image-to-video** (kling01imagetovideo.md)
  - 功能：图生视频(I2V)
  - 特点：专注图生视频

### 6. Wan 系列
- **wan2.5-text-to-video** (wan2.5texttovideo.md)
  - 功能：文生视频(T2V)
  - 特点：支持5秒和10秒时长，多种分辨率和宽高比

- **wan2.5-image-to-video** (wan2.5imagetovideo.md)
  - 功能：首帧图生视频(I2V)
  - 特点：专注首帧图生视频

- **wan2.6-text-to-video** (wan2.6.md)
  - 功能：文生视频(T2V)
  - 特点：升级版本

### 7. OmniHuman 系列
- **omnihuman-1.5** (OmniHuman1.5.md)
  - 功能：音频驱动数字人视频生成
  - 特点：支持音频驱动，35秒音频时长限制，多种数字人模型

## 二、按功能分类

### 1. 文生视频 (Text-to-Video, T2V)
**支持模型：**
- Veo系列：veo-3.1-fast, veo-3.1-generate-preview, veo3.1-pro
- Seedance系列：doubao-seedance-1.0-pro-fast, seedance-1.5-pro
- Hailuo系列：MiniMax-Hailuo-02, MiniMax-Hailuo-2.3
- Sora系列：sora-2-preview, sora-2-pro
- Wan系列：wan2.5-text-to-video, wan2.6-text-to-video

**核心参数：**
- `prompt`: 文本描述（必需）
- `quality`: 视频分辨率（480p/720p/1080p）
- `duration`: 视频时长（通常5-10秒）
- `aspect_ratio`: 宽高比（16:9, 9:16, 1:1等）

### 2. 图生视频 (Image-to-Video, I2V)
**支持模型：**
- Veo系列：veo-3.1-fast, veo-3.1-generate-preview（首帧）
- Seedance系列：doubao-seedance-1.0-pro-fast, seedance-1.5-pro
- Hailuo系列：MiniMax-Hailuo-02, MiniMax-Hailuo-2.3, MiniMax-Hailuo-2.3-Fast
- Sora系列：sora-2-preview, sora-2-pro
- Kling系列：kling-o1-image-to-video
- Wan系列：wan2.5-image-to-video（首帧）

**核心参数：**
- `image_urls`: 参考图片URL数组
- `prompt`: 运动描述（可选）
- `quality`: 视频分辨率
- `duration`: 视频时长

### 3. 首尾帧模式 (First-Last-Frame, FLF)
**支持模型：**
- Hailuo系列：MiniMax-Hailuo-02
- Seedance系列：seedance-1.5-pro
- Veo系列：veo3.1-pro

**核心参数：**
- `image_urls`: 2张图片（首帧和尾帧）
- `prompt`: 过渡描述（可选）
- `quality`: 视频分辨率
- `duration`: 视频时长

### 4. 视频编辑 (Video Editing)
**支持模型：**
- Kling系列：kling-o1-video-edit, kling-o1-video-edit-fast

**核心参数：**
- 视频编辑相关参数（具体参数需查看文档）

### 5. 音频驱动数字人 (Audio-driven Digital Human)
**支持模型：**
- OmniHuman系列：omnihuman-1.5

**核心参数：**
- `audio_url`: 音频文件URL（必需，≤35秒）
- `model_id`: 数字人模型ID
- `quality`: 视频分辨率（720p/1080p）
- `aspect_ratio`: 宽高比

## 三、通用技术规范

### 1. API端点
- **统一端点**: `POST /v1/videos/generations`
- **基础URL**: `https://api.evolink.ai`

### 2. 认证方式
- **类型**: Bearer Token
- **请求头**: `Authorization: Bearer YOUR_API_KEY`
- **获取**: https://evolink.ai/dashboard/keys

### 3. 处理模式
- **异步处理**: 所有模型均采用异步任务处理
- **任务查询**: `GET /v1/tasks/{task_id}`
- **状态**: pending → processing → completed/failed
- **进度**: 0-100%

### 4. 响应格式
```json
{
  "created": 1757169743,
  "id": "task-unified-1757169743-7cvnl5zw",
  "model": "model-name",
  "object": "video.generation.task",
  "progress": 0,
  "status": "pending"
}
```

### 5. 视频链接有效期
- **所有模型**: 24小时
- **建议**: 及时保存生成的视频

### 6. 错误处理
- **400**: 请求参数错误
- **401**: 认证失败
- **402**: 配额不足
- **403**: 无权限访问
- **404**: 资源不存在
- **429**: 请求频率超限
- **500/502/503**: 服务器错误

## 四、特色功能对比

### 1. 相机运动指令（Hailuo系列独有）
支持15种相机运动指令：
- Truck: `[Truck left]`, `[Truck right]`
- Pan: `[Pan left]`, `[Pan right]`
- Dolly: `[Push in]`, `[Pull out]`
- Pedestal: `[Pedestal up]`, `[Pedestal down]`
- Tilt: `[Tilt up]`, `[Tilt down]`
- Zoom: `[Zoom in]`, `[Zoom out]`
- Special: `[Shake]`, `[Tracking shot]`, `[Static shot]`

### 2. 分辨率支持
- **512p**: MiniMax-Hailuo-02（仅I2V模式）
- **480p**: Seedance系列, Wan系列
- **720p**: 大部分模型
- **1080p**: 大部分模型

### 3. 时长支持
- **2-12秒**: doubao-seedance-1.0-pro-fast
- **5秒**: 多数模型默认
- **6秒**: Hailuo系列
- **10秒**: 多数模型支持（1080p通常不支持）

### 4. 内容审核
- **严格审核**: Sora系列（OpenAI）
- **标准审核**: 其他模型

### 5. 提示词优化
- **自动优化**: 多数模型支持 `prompt_optimizer` 参数
- **快速预处理**: 部分模型支持 `fast_pretreatment` 参数

## 五、使用建议

### 1. 模型选择建议
- **快速原型**: Hailuo-2.3-Fast, kling-o1-video-edit-fast
- **高质量输出**: Sora-2-pro, Hailuo-2.3, seedance-1.5-pro
- **多功能需求**: Hailuo-02, seedance-1.5-pro（支持T2V+I2V+FLF）
- **数字人视频**: omnihuman-1.5
- **视频编辑**: Kling系列

### 2. 成本优化
- **低分辨率**: 480p/512p 价格更低
- **短时长**: 5-6秒比10秒便宜
- **批量处理**: 使用callback_url异步处理

### 3. 质量优化
- **提示词**: 详细描述场景、动作、风格
- **相机运动**: 使用Hailuo系列的相机指令
- **参考图片**: I2V模式提供高质量参考图
- **提示词优化**: 启用自动优化功能
