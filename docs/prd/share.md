 AI视频分享功能 PRD & 执行规划                                                      
                                                                                     
  一、产品概述                                                                       
                                                                                     
  1.1 项目背景                                                                       
                                                                                     
  当前GenX平台的AI视频生成功能已完善，但缺少视频分享和社区展示功能。用户生成的视频仅 
  能私人保存，无法分享到社交媒体或展示在公开画廊中。                                 
                                                                                     
  1.2 核心目标                                                                       
                                                                                     
  构建混合模式的视频分享系统：                                                       
  - 社区展示：优质作品公开展示，形成创作者社区                                       
  - 营销推广：通过用户作品展示平台能力，吸引新用户                                   
  - 个人分享：用户可将作品分享到社交媒体                                             
                                                                                     
  1.3 成功指标                                                                       
  ┌────────────────┬────────────────────────┐                                        
  │      指标      │         目标值         │                                        
  ├────────────────┼────────────────────────┤                                        
  │ 分享率         │ ≥15% 的视频被分享      │                                        
  ├────────────────┼────────────────────────┤                                        
  │ 公开申请率     │ ≥10% 的视频申请公开    │                                        
  ├────────────────┼────────────────────────┤                                        
  │ 画廊日活       │ 上线后30天达到1000 DAU │                                        
  ├────────────────┼────────────────────────┤                                        
  │ 分享链接点击率 │ ≥5% CTR                │                                        
  └────────────────┴────────────────────────┘                                        
  ---                                                                                
  二、功能需求                                                                       
                                                                                     
  2.1 可见性控制系统                                                                 
                                                                                     
  2.1.1 三级可见性                                                                   
  ┌────────┬──────────┬──────────────────────┬────────────┐                          
  │  级别  │   标识   │         说明         │  访问权限  │                          
  ├────────┼──────────┼──────────────────────┼────────────┤                          
  │ 私有   │ PRIVATE  │ 默认状态，仅自己可见 │ 仅创作者   │                          
  ├────────┼──────────┼──────────────────────┼────────────┤                          
  │ 仅链接 │ UNLISTED │ 知道链接的人可访问   │ 持有链接者 │                          
  ├────────┼──────────┼──────────────────────┼────────────┤                          
  │ 公开   │ PUBLIC   │ 出现在公开画廊       │ 所有人     │                          
  └────────┴──────────┴──────────────────────┴────────────┘                          
  2.1.2 审核状态（公开视频）                                                         
  ┌────────┬──────────┬────────────────────────┐                                     
  │  状态  │   标识   │          说明          │                                     
  ├────────┼──────────┼────────────────────────┤                                     
  │ 待审核 │ PENDING  │ 用户申请公开，等待审核 │                                     
  ├────────┼──────────┼────────────────────────┤                                     
  │ 已通过 │ APPROVED │ 审核通过，展示在画廊   │                                     
  ├────────┼──────────┼────────────────────────┤                                     
  │ 已拒绝 │ REJECTED │ 审核未通过，附带原因   │                                     
  ├────────┼──────────┼────────────────────────┤                                     
  │ 精选   │ FEATURED │ 管理员精选优质内容     │                                     
  └────────┴──────────┴────────────────────────┘                                     
  2.1.3 业务规则                                                                     
                                                                                     
  - 新生成视频默认为 PRIVATE                                                         
  - 用户可随时在三种可见性之间切换                                                   
  - 设置为 PUBLIC 时自动进入审核队列（状态为 PENDING）                               
  - 从 PUBLIC 切换回 PRIVATE/UNLISTED 时，自动从画廊移除                             
  - 被拒绝的视频可修改后重新申请                                                     
                                                                                     
  ---                                                                                
  2.2 分享链接系统                                                                   
                                                                                     
  2.2.1 链接格式                                                                     
                                                                                     
  https://domain.com/share/{shortId}                                                 
  - 使用 nanoid 生成8位短ID                                                          
  - 示例：/share/V1StGXR8                                                            
                                                                                     
  2.2.2 分享页面内容                                                                 
  ┌────────────┬──────────────────────────┬──────────┐                               
  │    元素    │           说明           │ 登录要求 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 视频播放器 │ 自动播放，支持全屏       │ 无需登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 视频信息   │ 标题、提示词、模型、时长 │ 无需登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 创作者信息 │ 头像、昵称、链接到主页   │ 无需登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 点赞按钮   │ 显示点赞数，点击需登录   │ 需要登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 收藏按钮   │ 收藏到个人收藏夹         │ 需要登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 再创作按钮 │ 使用相同提示词创作       │ 需要登录 │                               
  ├────────────┼──────────────────────────┼──────────┤                               
  │ 分享按钮   │ 复制链接、分享到社交媒体 │ 无需登录 │                               
  └────────────┴──────────────────────────┴──────────┘                               
  2.2.3 SEO优化                                                                      
                                                                                     
  <!-- Open Graph -->                                                                
  <meta property="og:title" content="AI生成视频 - {prompt摘要}">                     
  <meta property="og:description" content="由 {用户名} 使用 {模型} 创作">            
  <meta property="og:image" content="{视频封面图}">                                  
  <meta property="og:video" content="{视频URL}">                                     
  <meta property="og:type" content="video.other">                                    
                                                                                     
  <!-- Twitter Card -->                                                              
  <meta name="twitter:card" content="player">                                        
  <meta name="twitter:title" content="AI生成视频 - {prompt摘要}">                    
  <meta name="twitter:player" content="{嵌入播放器URL}">                             
                                                                                     
  ---                                                                                
  2.3 公开画廊系统                                                                   
                                                                                     
  2.3.1 展示方式                                                                     
                                                                                     
  - 布局：响应式瀑布流/网格布局                                                      
  - 卡片内容：视频封面、时长、点赞数、创作者头像                                     
  - 交互：悬停预览播放、点击进入详情页                                               
                                                                                     
  2.3.2 筛选条件                                                                     
  ┌────────┬─────────────────────────────────────────────────┐                       
  │ 筛选项 │                     选项值                      │                       
  ├────────┼─────────────────────────────────────────────────┤                       
  │ 模型   │ Sora 2, Wan 2.6, Veo 3.1, Seedance 1.5, Kling 2 │                       
  ├────────┼─────────────────────────────────────────────────┤                       
  │ 风格   │ 动漫、写实、赛博朋克、自然、抽象等              │                       
  ├────────┼─────────────────────────────────────────────────┤                       
  │ 时长   │ 5秒、10秒、15秒、20秒+                          │                       
  ├────────┼─────────────────────────────────────────────────┤                       
  │ 宽高比 │ 16:9、9:16、1:1                                 │                       
  └────────┴─────────────────────────────────────────────────┘                       
  2.3.3 排序方式                                                                     
  ┌──────┬─────────────────────────┐                                                 
  │ 排序 │        算法说明         │                                                 
  ├──────┼─────────────────────────┤                                                 
  │ 推荐 │ 热度趋势算法（见2.3.4） │                                                 
  ├──────┼─────────────────────────┤                                                 
  │ 最新 │ 按审核通过时间倒序      │                                                 
  ├──────┼─────────────────────────┤                                                 
  │ 最热 │ 按总点赞数倒序          │                                                 
  └──────┴─────────────────────────┘                                                 
  2.3.4 热度趋势算法                                                                 
                                                                                     
  热度分数 = (点赞数 × 权重1 + 收藏数 × 权重2 + 浏览数 × 权重3) / (时间衰减因子)     
                                                                                     
  时间衰减因子 = (当前时间 - 发布时间 + 基准时间)^衰减指数                           
                                                                                     
  推荐参数：                                                                         
  - 权重1 (点赞): 3                                                                  
  - 权重2 (收藏): 5                                                                  
  - 权重3 (浏览): 1                                                                  
  - 基准时间: 2小时                                                                  
  - 衰减指数: 1.5                                                                    
                                                                                     
  ---                                                                                
  2.4 社交功能                                                                       
                                                                                     
  2.4.1 点赞系统                                                                     
  ┌──────────┬────────────────────────────────┐                                      
  │   规则   │              说明              │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 登录要求 │ 必须登录才能点赞               │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 重复点赞 │ 同一用户对同一视频只能点赞一次 │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 取消点赞 │ 支持取消点赞                   │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 计数更新 │ 实时更新点赞数                 │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 防刷机制 │ 同一IP每分钟最多10次点赞操作   │                                      
  └──────────┴────────────────────────────────┘                                      
  2.4.2 收藏系统                                                                     
  ┌──────────┬────────────────────────┐                                              
  │   规则   │          说明          │                                              
  ├──────────┼────────────────────────┤                                              
  │ 登录要求 │ 必须登录才能收藏       │                                              
  ├──────────┼────────────────────────┤                                              
  │ 收藏夹   │ 个人收藏夹，仅自己可见 │                                              
  ├──────────┼────────────────────────┤                                              
  │ 取消收藏 │ 支持取消收藏           │                                              
  ├──────────┼────────────────────────┤                                              
  │ 收藏列表 │ 在个人中心查看收藏列表 │                                              
  └──────────┴────────────────────────┘                                              
  ---                                                                                
  2.5 用户主页                                                                       
                                                                                     
  2.5.1 页面URL                                                                      
                                                                                     
  https://domain.com/u/{username}                                                    
                                                                                     
  2.5.2 页面内容                                                                     
  ┌──────────┬────────────────────────────────┐                                      
  │   区域   │              内容              │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 头部     │ 头像、昵称、简介、社交链接     │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 统计     │ 作品数、总点赞数、总收藏数     │                                      
  ├──────────┼────────────────────────────────┤                                      
  │ 作品列表 │ 该用户的公开作品（已审核通过） │                                      
  └──────────┴────────────────────────────────┘                                      
  2.5.3 个人资料字段                                                                 
  ┌──────────┬────────┬───────────────────────────────┐                              
  │   字段   │  类型  │             说明              │                              
  ├──────────┼────────┼───────────────────────────────┤                              
  │ 昵称     │ string │ 显示名称                      │                              
  ├──────────┼────────┼───────────────────────────────┤                              
  │ 简介     │ string │ 个人简介，最多200字           │                              
  ├──────────┼────────┼───────────────────────────────┤                              
  │ 头像     │ string │ 头像URL                       │                              
  ├──────────┼────────┼───────────────────────────────┤                              
  │ 社交链接 │ object │ Twitter、Instagram、YouTube等 │                              
  └──────────┴────────┴───────────────────────────────┘                              
  ---                                                                                
  2.6 审核系统                                                                       
                                                                                     
  2.6.1 审核流程                                                                     
                                                                                     
  用户申请公开 → 进入审核队列(PENDING) → 管理员审核                                  
                                          ├→ 通过(APPROVED) → 展示在画廊             
                                          └→ 拒绝(REJECTED) → 通知用户原因           
                                                                                     
  2.6.2 管理员精选流程                                                               
                                                                                     
  管理员浏览画廊 → 发现优质内容 → 标记为精选(FEATURED) → 首页/画廊置顶展示           
                                                                                     
  2.6.3 审核标准                                                                     
                                                                                     
  - ✅ 内容健康，无违规                                                              
  - ✅ 视频质量清晰                                                                  
  - ✅ 提示词描述准确                                                                
  - ❌ 涉及暴力、色情、政治敏感                                                      
  - ❌ 侵犯版权                                                                      
  - ❌ 低质量/无意义内容                                                             
                                                                                     
  ---                                                                                
  三、数据库设计                                                                     
                                                                                     
  3.1 修改 videos 表                                                                 
                                                                                     
  ALTER TABLE videos ADD COLUMN                                                      
    -- 分享相关                                                                      
    short_id VARCHAR(12) UNIQUE,           -- nanoid生成的短ID                       
    visibility VARCHAR(20) DEFAULT 'PRIVATE', -- PRIVATE | UNLISTED | PUBLIC         
    review_status VARCHAR(20),              -- PENDING | APPROVED | REJECTED |       
  FEATURED                                                                           
    review_note TEXT,                       -- 审核备注/拒绝原因                     
    reviewed_at TIMESTAMP,                  -- 审核时间                              
    reviewed_by VARCHAR(36),                -- 审核人ID                              
                                                                                     
    -- 统计相关                                                                      
    view_count INTEGER DEFAULT 0,           -- 浏览次数                              
    like_count INTEGER DEFAULT 0,           -- 点赞数                                
    favorite_count INTEGER DEFAULT 0,       -- 收藏数                                
    share_count INTEGER DEFAULT 0,          -- 分享次数                              
                                                                                     
    -- 元数据                                                                        
    style VARCHAR(50),                      -- 视频风格标签                          
    thumbnail_url TEXT;                     -- 视频封面图URL                         
                                                                                     
  3.2 新增 video_likes 表                                                            
                                                                                     
  CREATE TABLE video_likes (                                                         
    id VARCHAR(36) PRIMARY KEY,                                                      
    video_uuid VARCHAR(36) NOT NULL REFERENCES videos(uuid),                         
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),                               
    created_at TIMESTAMP DEFAULT NOW(),                                              
                                                                                     
    UNIQUE(video_uuid, user_id)  -- 防止重复点赞                                     
  );                                                                                 
                                                                                     
  CREATE INDEX idx_video_likes_video ON video_likes(video_uuid);                     
  CREATE INDEX idx_video_likes_user ON video_likes(user_id);                         
                                                                                     
  3.3 新增 video_favorites 表                                                        
                                                                                     
  CREATE TABLE video_favorites (                                                     
    id VARCHAR(36) PRIMARY KEY,                                                      
    video_uuid VARCHAR(36) NOT NULL REFERENCES videos(uuid),                         
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),                               
    created_at TIMESTAMP DEFAULT NOW(),                                              
                                                                                     
    UNIQUE(video_uuid, user_id)  -- 防止重复收藏                                     
  );                                                                                 
                                                                                     
  CREATE INDEX idx_video_favorites_user ON video_favorites(user_id);                 
                                                                                     
  3.4 新增 video_views 表                                                            
                                                                                     
  CREATE TABLE video_views (                                                         
    id VARCHAR(36) PRIMARY KEY,                                                      
    video_uuid VARCHAR(36) NOT NULL REFERENCES videos(uuid),                         
    viewer_id VARCHAR(36) REFERENCES users(id),  -- 可为空（未登录用户）             
    viewer_ip VARCHAR(45),                        -- IP地址                          
    created_at TIMESTAMP DEFAULT NOW()                                               
  );                                                                                 
                                                                                     
  CREATE INDEX idx_video_views_video ON video_views(video_uuid);                     
  CREATE INDEX idx_video_views_time ON video_views(created_at);                      
                                                                                     
  3.5 修改 users 表                                                                  
                                                                                     
  ALTER TABLE users ADD COLUMN                                                       
    username VARCHAR(50) UNIQUE,            -- 用户名（用于URL）                     
    bio TEXT,                               -- 个人简介                              
    social_links JSONB DEFAULT '{}';        -- 社交链接                              
                                                                                     
  ---                                                                                
  四、API设计                                                                        
                                                                                     
  4.1 视频可见性管理                                                                 
                                                                                     
  更新视频可见性                                                                     
                                                                                     
  PATCH /api/v1/video/{uuid}/visibility                                              
  Body: { visibility: "PRIVATE" | "UNLISTED" | "PUBLIC" }                            
  Response: { success: true, visibility, reviewStatus }                              
                                                                                     
  获取分享链接                                                                       
                                                                                     
  GET /api/v1/video/{uuid}/share-link                                                
  Response: { shortId, shareUrl, visibility }                                        
                                                                                     
  4.2 分享页面                                                                       
                                                                                     
  获取分享视频详情                                                                   
                                                                                     
  GET /api/v1/share/{shortId}                                                        
  Response: {                                                                        
    video: { uuid, prompt, model, duration, videoUrl, thumbnailUrl, ... },           
    creator: { id, name, image, username },                                          
    stats: { viewCount, likeCount, favoriteCount },                                  
    isLiked: boolean,      // 当前用户是否已点赞                                     
    isFavorited: boolean   // 当前用户是否已收藏                                     
  }                                                                                  
                                                                                     
  4.3 社交功能                                                                       
                                                                                     
  点赞/取消点赞                                                                      
                                                                                     
  POST /api/v1/video/{uuid}/like                                                     
  Response: { liked: boolean, likeCount: number }                                    
                                                                                     
  收藏/取消收藏                                                                      
                                                                                     
  POST /api/v1/video/{uuid}/favorite                                                 
  Response: { favorited: boolean, favoriteCount: number }                            
                                                                                     
  记录浏览                                                                           
                                                                                     
  POST /api/v1/video/{uuid}/view                                                     
  Response: { viewCount: number }                                                    
                                                                                     
  4.4 公开画廊                                                                       
                                                                                     
  获取画廊列表                                                                       
                                                                                     
  GET /api/v1/gallery                                                                
  Query: {                                                                           
    sort: "trending" | "latest" | "popular",                                         
    model?: string,                                                                  
    style?: string,                                                                  
    duration?: string,                                                               
    aspectRatio?: string,                                                            
    page?: number,                                                                   
    limit?: number                                                                   
  }                                                                                  
  Response: {                                                                        
    videos: [...],                                                                   
    pagination: { page, limit, total, totalPages }                                   
  }                                                                                  
                                                                                     
  获取精选视频                                                                       
                                                                                     
  GET /api/v1/gallery/featured                                                       
  Response: { videos: [...] }                                                        
                                                                                     
  4.5 用户主页                                                                       
                                                                                     
  获取用户公开资料                                                                   
                                                                                     
  GET /api/v1/users/{username}/profile                                               
  Response: {                                                                        
    user: { id, name, username, image, bio, socialLinks },                           
    stats: { videoCount, totalLikes, totalFavorites }                                
  }                                                                                  
                                                                                     
  获取用户公开作品                                                                   
                                                                                     
  GET /api/v1/users/{username}/videos                                                
  Query: { page, limit }                                                             
  Response: { videos: [...], pagination: {...} }                                     
                                                                                     
  更新个人资料                                                                       
                                                                                     
  PATCH /api/v1/users/me/profile                                                     
  Body: { username?, bio?, socialLinks? }                                            
  Response: { success: true, user: {...} }                                           
                                                                                     
  4.6 收藏夹                                                                         
                                                                                     
  获取我的收藏                                                                       
                                                                                     
  GET /api/v1/me/favorites                                                           
  Query: { page, limit }                                                             
  Response: { videos: [...], pagination: {...} }                                     
                                                                                     
  4.7 审核管理（管理员）                                                             
                                                                                     
  获取待审核列表                                                                     
                                                                                     
  GET /api/v1/admin/videos/pending                                                   
  Query: { page, limit }                                                             
  Response: { videos: [...], pagination: {...} }                                     
                                                                                     
  审核视频                                                                           
                                                                                     
  POST /api/v1/admin/videos/{uuid}/review                                            
  Body: {                                                                            
    action: "approve" | "reject" | "feature",                                        
    note?: string  // 拒绝原因                                                       
  }                                                                                  
  Response: { success: true, reviewStatus }                                          
                                                                                     
  ---                                                                                
  五、前端页面设计                                                                   
                                                                                     
  5.1 页面清单                                                                       
  ┌──────────┬──────────────────────┬────────────────────────────┐                   
  │   页面   │         路由         │            说明            │                   
  ├──────────┼──────────────────────┼────────────────────────────┤                   
  │ 分享页   │ /share/[shortId]     │ 视频分享详情页             │                   
  ├──────────┼──────────────────────┼────────────────────────────┤                   
  │ 公开画廊 │ /gallery             │ 改造现有页面，展示真实数据 │                   
  ├──────────┼──────────────────────┼────────────────────────────┤                   
  │ 用户主页 │ /u/[username]        │ 用户公开资料和作品         │                   
  ├──────────┼──────────────────────┼────────────────────────────┤                   
  │ 我的收藏 │ /dashboard/favorites │ 个人收藏夹                 │                   
  ├──────────┼──────────────────────┼────────────────────────────┤                   
  │ 审核管理 │ /admin/reviews       │ 管理员审核页面             │                   
  └──────────┴──────────────────────┴────────────────────────────┘                   
  5.2 组件清单                                                                       
  ┌────────────────────┬──────────────────────────────────┐                          
  │        组件        │               说明               │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ VideoCard          │ 视频卡片（画廊、用户主页使用）   │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ VideoPlayer        │ 视频播放器（支持封面、自动播放） │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ VisibilitySelector │ 可见性选择器（私有/链接/公开）   │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ ShareDialog        │ 分享弹窗（复制链接、社交分享）   │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ LikeButton         │ 点赞按钮（带动画）               │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ FavoriteButton     │ 收藏按钮                         │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ CreatorCard        │ 创作者信息卡片                   │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ GalleryFilter      │ 画廊筛选器                       │                          
  ├────────────────────┼──────────────────────────────────┤                          
  │ ReviewPanel        │ 审核操作面板（管理员）           │                          
  └────────────────────┴──────────────────────────────────┘                          
  ---                                                                                
  六、分阶段实施计划                                                                 
                                                                                     
  Phase 1: 基础分享（1-2周）                                                         
                                                                                     
  目标：实现基本的分享链接功能                                                       
                                                                                     
  任务清单：                                                                         
  1. 数据库迁移                                                                      
    - 添加 videos 表新字段（shortId, visibility, 统计字段）                          
    - 创建 video_likes 表                                                            
    - 创建 video_favorites 表                                                        
    - 创建 video_views 表                                                            
  2. 后端API                                                                         
    - 视频生成时自动生成 shortId                                                     
    - 实现可见性更新 API                                                             
    - 实现分享详情 API                                                               
    - 实现点赞/收藏 API                                                              
    - 实现浏览记录 API                                                               
  3. 前端页面                                                                        
    - 分享页面 /share/[shortId]                                                      
    - 视频详情页添加可见性选择器                                                     
    - 视频详情页添加分享按钮                                                         
    - SEO meta 标签                                                                  
                                                                                     
  交付物：                                                                           
  - 用户可以生成分享链接                                                             
  - 分享链接可以被访问和播放                                                         
  - 支持点赞和收藏                                                                   
                                                                                     
  ---                                                                                
  Phase 2: 公开画廊（1-2周）                                                         
                                                                                     
  目标：实现公开画廊展示                                                             
                                                                                     
  任务清单：                                                                         
  1. 数据库                                                                          
    - 添加审核相关字段（reviewStatus, reviewNote等）                                 
    - 添加 style 标签字段                                                            
    - 添加 thumbnailUrl 字段                                                         
  2. 后端API                                                                         
    - 实现画廊列表 API（含筛选、排序）                                               
    - 实现热度趋势算法                                                               
    - 实现精选视频 API                                                               
    - 视频生成时自动提取封面图                                                       
  3. 前端页面                                                                        
    - 改造 /gallery 页面使用真实数据                                                 
    - 实现瀑布流/网格布局                                                            
    - 实现筛选和排序功能                                                             
    - 实现无限滚动加载                                                               
                                                                                     
  交付物：                                                                           
  - 公开画廊展示真实用户作品                                                         
  - 支持按模型、风格、时长筛选                                                       
  - 支持推荐、最新、最热排序                                                         
                                                                                     
  ---                                                                                
  Phase 3: 审核系统（1周）                                                           
                                                                                     
  目标：实现内容审核机制                                                             
                                                                                     
  任务清单：                                                                         
  1. 后端API                                                                         
    - 实现待审核列表 API                                                             
    - 实现审核操作 API                                                               
    - 实现精选标记 API                                                               
    - 审核状态变更通知（邮件/站内）                                                  
  2. 前端页面                                                                        
    - 管理员审核页面 /admin/reviews                                                  
    - 审核操作面板                                                                   
    - 用户端审核状态展示                                                             
                                                                                     
  交付物：                                                                           
  - 管理员可以审核用户提交的公开申请                                                 
  - 管理员可以精选优质内容                                                           
  - 用户可以看到审核状态                                                             
                                                                                     
  ---                                                                                
  Phase 4: 用户主页（1周）                                                           
                                                                                     
  目标：实现用户公开主页                                                             
                                                                                     
  任务清单：                                                                         
  1. 数据库                                                                          
    - 添加 users 表新字段（username, bio, socialLinks）                              
  2. 后端API                                                                         
    - 实现用户资料 API                                                               
    - 实现用户作品列表 API                                                           
    - 实现资料更新 API                                                               
    - 用户名唯一性检查                                                               
  3. 前端页面                                                                        
    - 用户主页 /u/[username]                                                         
    - 个人资料编辑页面                                                               
    - 我的收藏页面 /dashboard/favorites                                              
                                                                                     
  交付物：                                                                           
  - 用户拥有公开主页                                                                 
  - 可以编辑个人资料和社交链接                                                       
  - 可以查看和管理收藏                                                               
                                                                                     
  ---                                                                                
  Phase 5: 优化与增强（持续）                                                        
                                                                                     
  任务清单：                                                                         
  - 推荐算法优化                                                                     
  - 性能优化（缓存、CDN）                                                            
  - 数据分析和统计                                                                   
  - 举报功能                                                                         
  - 评论功能（可选）                                                                 
  - 关注功能（可选）                                                                 
                                                                                     
  ---                                                                                
  七、技术要点                                                                       
                                                                                     
  7.1 短ID生成                                                                       
                                                                                     
  import { nanoid } from 'nanoid'                                                    
                                                                                     
  // 生成8位短ID                                                                     
  const shortId = nanoid(8)  // 例如: V1StGXR8                                       
                                                                                     
  7.2 热度算法实现                                                                   
                                                                                     
  function calculateTrendingScore(video: Video): number {                            
    const LIKE_WEIGHT = 3                                                            
    const FAVORITE_WEIGHT = 5                                                        
    const VIEW_WEIGHT = 1                                                            
    const BASE_TIME = 2 * 60 * 60 * 1000 // 2小时                                    
    const DECAY_FACTOR = 1.5                                                         
                                                                                     
    const score =                                                                    
      video.likeCount * LIKE_WEIGHT +                                                
      video.favoriteCount * FAVORITE_WEIGHT +                                        
      video.viewCount * VIEW_WEIGHT                                                  
                                                                                     
    const ageMs = Date.now() - video.approvedAt.getTime()                            
    const decay = Math.pow((ageMs + BASE_TIME) / BASE_TIME, DECAY_FACTOR)            
                                                                                     
    return score / decay                                                             
  }                                                                                  
                                                                                     
  7.3 防刷机制                                                                       
                                                                                     
  // 使用 rate-limiter-flexible                                                      
  const rateLimiter = new RateLimiterMemory({                                        
    points: 10,      // 10次操作                                                     
    duration: 60,    // 每分钟                                                       
  })                                                                                 
                                                                                     
  // 在点赞API中使用                                                                 
  await rateLimiter.consume(clientIP)                                                
                                                                                     
  ---                                                                                
  八、风险与对策                                                                     
  ┌──────────┬────────────┬──────────────────────────────┐                           
  │   风险   │    影响    │             对策             │                           
  ├──────────┼────────────┼──────────────────────────────┤                           
  │ 内容违规 │ 法律风险   │ 人工审核 + 举报机制          │                           
  ├──────────┼────────────┼──────────────────────────────┤                           
  │ 刷赞刷量 │ 数据失真   │ 登录限制 + IP限流 + 异常检测 │                           
  ├──────────┼────────────┼──────────────────────────────┤                           
  │ 视频盗用 │ 版权纠纷   │ 水印 + 举报机制              │                           
  ├──────────┼────────────┼──────────────────────────────┤                           
  │ 性能瓶颈 │ 用户体验差 │ CDN + 缓存 + 分页            │                           
  ├──────────┼────────────┼──────────────────────────────┤                           
  │ 存储成本 │ 成本增加   │ 视频压缩 + 过期清理          │                           
  └──────────┴────────────┴──────────────────────────────┘                           
  ---                                                                                
  这份PRD涵盖了完整的需求定义、数据库设计、API设计和分阶段实施计划。是否需要我进一步 
  细化某个部分？                   