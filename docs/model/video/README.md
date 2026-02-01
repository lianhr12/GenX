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

## 六、定价信息

### 1. Veo 系列（Google）

#### Veo 3.1 Fast
| 分辨率 | 音频 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 720p/1080p | 无音频 | 5.760 |
| 720p/1080p | 有音频 | 8.640 |
| 4K | 无音频 | 17.280 |
| 4K | 有音频 | 20.218 |

#### Veo 3.1 Fast Lite
| 分辨率 | 价格 (Credits/视频) |
|--------|---------------------|
| 720p/1080p | 12.100 |
| 4K | 36.300 |

#### Veo 3.1 Pro
| 分辨率 | 音频 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 720p/1080p | 无音频 | 11.520 |
| 720p/1080p | 有音频 | 23.040 |
| 4K | 无音频 | 23.040 |
| 4K | 有音频 | 34.560 |

#### Veo 3.1 Pro Lite
| 分辨率 | 价格 (Credits/视频) |
|--------|---------------------|
| 720p/1080p | 60.000 |
| 4K | 90.000 |

### 2. Seedance 系列（字节跳动）

#### Seedance 1.0 Pro Fast
| 分辨率 | 价格 (Credits/秒) |
|--------|-------------------|
| 480p | 0.405 |
| 720p | 0.900 |
| 1080p | 1.980 |

#### Seedance 1.5 Pro
| 分辨率 | 音频 | 价格 (Credits/秒) |
|--------|------|-------------------|
| 480p | 无音频 | 0.818 |
| 480p | 有音频 | 1.636 |
| 720p | 无音频 | 1.778 |
| 720p | 有音频 | 3.556 |
| 1080p | 无音频 | 3.966 |
| 1080p | 有音频 | 7.932 |

### 3. Hailuo 系列（MiniMax）

#### Hailuo 2.3
| 分辨率 | 时长 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 768p | 6秒 | 18.000 |
| 768p | 10秒 | 36.000 |
| 1080p | 6秒 | 36.000 |

#### Hailuo 2.3 Fast
| 分辨率 | 时长 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 768p | 6秒 | 12.000 |
| 768p | 10秒 | 18.840 |
| 1080p | 6秒 | 22.320 |

### 4. Sora 系列（OpenAI）

#### Sora 2 Preview
| 时长 | 价格 (Credits/视频) |
|------|---------------------|
| 4秒 | 23.040 |
| 8秒 | 46.080 |
| 12秒 | 69.120 |

#### Sora 2 Lite
| 时长 | 水印 | 价格 (Credits/视频) |
|------|------|---------------------|
| 10秒 | 保留水印 | 2.300 |
| 10秒 | 去除水印 | 3.737 |
| 15秒 | 保留水印 | 3.737 |
| 15秒 | 去除水印 | 5.175 |

#### Sora 2 Pro
| 时长 | 质量 | 价格 (Credits/视频) |
|------|------|---------------------|
| 15秒 | HD | 69.000 |
| 25秒 | Standard | 69.000 |

### 5. Kling 系列（快手）

#### Kling O1 Image to Video
| 时长 | 价格 (Credits/视频) |
|------|---------------------|
| 5秒 | 40.000 |
| 10秒 | 80.000 |

#### Kling O1 Video Edit
| 计费方式 | 价格 |
|----------|------|
| 按秒计费 (3-10秒) | 12.000 Credits/秒 |

#### Kling O1 Video Edit Fast
| 计费方式 | 价格 |
|----------|------|
| 按秒计费 (6-20秒) | 6.800 Credits/秒 |

### 6. WAN 系列（阿里巴巴）

#### WAN 2.5 Text-to-Video / Image-to-Video
| 分辨率 | 时长 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 480p | 5秒 | 12.750 |
| 480p | 10秒 | 25.500 |
| 720p | 5秒 | 25.500 |
| 720p | 10秒 | 51.000 |
| 1080p | 5秒 | 42.585 |
| 1080p | 10秒 | 85.170 |

#### WAN 2.6 Text-to-Video / Image-to-Video
| 分辨率 | 时长 | 价格 (Credits/视频) |
|--------|------|---------------------|
| 720p | 5秒 | 25.500 |
| 720p | 10秒 | 51.000 |
| 720p | 15秒 | 76.500 |
| 1080p | 5秒 | 42.585 |
| 1080p | 10秒 | 85.170 |
| 1080p | 15秒 | 127.755 |

#### WAN 2.6 Reference Video
| 类型 | 分辨率 | 时长 | 价格 |
|------|--------|------|------|
| 输入视频 | 720p | - | 5.100 Credits/秒 |
| 输入视频 | 1080p | - | 8.517 Credits/秒 |
| 输出视频 | 720p | 5秒 | 25.500 Credits/视频 |
| 输出视频 | 720p | 10秒 | 51.000 Credits/视频 |
| 输出视频 | 1080p | 5秒 | 42.585 Credits/视频 |
| 输出视频 | 1080p | 10秒 | 85.170 Credits/视频 |

### 7. OmniHuman 系列

#### OmniHuman 1.5
| 计费方式 | 价格 |
|----------|------|
| 按秒计费 | 12.000 Credits/秒 |

> **注意**: 音频时长限制为35秒

### 8. 定价汇总对比表

| 模型 | 计费方式 | 最低价格 | 最高价格 |
|------|----------|----------|----------|
| Veo 3.1 Fast | 按视频 | 5.760 | 20.218 |
| Veo 3.1 Fast Lite | 按视频 | 12.100 | 36.300 |
| Veo 3.1 Pro | 按视频 | 11.520 | 34.560 |
| Veo 3.1 Pro Lite | 按视频 | 60.000 | 90.000 |
| Seedance 1.0 Pro Fast | 按秒 | 0.405 | 1.980 |
| Seedance 1.5 Pro | 按秒 | 0.818 | 7.932 |
| Hailuo 2.3 | 按视频 | 18.000 | 36.000 |
| Hailuo 2.3 Fast | 按视频 | 12.000 | 22.320 |
| Sora 2 Preview | 按视频 | 23.040 | 69.120 |
| Sora 2 Lite | 按视频 | 2.300 | 5.175 |
| Sora 2 Pro | 按视频 | 69.000 | 69.000 |
| Kling O1 I2V | 按视频 | 40.000 | 80.000 |
| Kling O1 Video Edit | 按秒 | 12.000 | 12.000 |
| Kling O1 Video Edit Fast | 按秒 | 6.800 | 6.800 |
| WAN 2.5 | 按视频 | 12.750 | 85.170 |
| WAN 2.6 | 按视频 | 25.500 | 127.755 |
| WAN 2.6 Reference | 按秒/视频 | 5.100/秒 | 85.170/视频 |
| OmniHuman 1.5 | 按秒 | 12.000 | 12.000 |

> **说明**:
> - 所有价格单位为 Credits
> - 按秒计费的模型，总价格 = 单价 × 视频时长（秒）
> - 实际价格可能因促销活动或套餐而有所不同，请以官方最新定价为准
