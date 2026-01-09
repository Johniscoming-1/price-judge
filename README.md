# 价格审判长 (Price Judge)

一个智能的电商价格分析工具，帮助用户做出更明智的购物决策。

## 项目简介

价格审判长是一个面向中国用户的 PWA（渐进式 Web 应用），支持京东、淘宝、拼多多、抖音、美团等主流电商平台的商品价格查询和分析。通过 AI 智能分析历史价格数据，为用户提供专业的购买建议。

## 核心功能

### 免费功能
- ✅ **商品链接解析**：支持京东、淘宝、拼多多、抖音、美团等平台
- ✅ **历史价格查询**：展示 30 天历史价格曲线图
- ✅ **AI 价格分析**：智能判断价格是否合理（偏高/合理/较低）
- ✅ **商品收藏**：收藏感兴趣的商品，随时查看价格变化

### VIP 功能
- 🌟 **深度价格分析**：查看 90/180 天历史数据
- 🌟 **降价提醒**：设置目标价格，降价时自动推送通知
- 🌟 **消费报告**：生成详细的价格分析报告

## 技术栈

### 前端
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts（图表）
- tRPC（类型安全的 API 调用）
- Wouter（路由）

### 后端
- Node.js + Express
- tRPC 11（端到端类型安全）
- Drizzle ORM
- MySQL/TiDB

### AI 集成
- 使用 Manus 内置 LLM API 进行价格分析
- 支持结构化 JSON 输出

## 项目结构

```
price-judge/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.tsx           # 首页
│   │   │   ├── ProductDetail.tsx  # 商品详情页
│   │   │   ├── Favorites.tsx      # 收藏列表
│   │   │   └── VipGuide.tsx       # VIP 引导页
│   │   ├── components/    # UI 组件
│   │   ├── lib/           # 工具库
│   │   └── App.tsx        # 应用入口
│   └── public/            # 静态资源
├── server/                # 后端代码
│   ├── routers.ts         # tRPC 路由定义
│   ├── db.ts              # 数据库查询函数
│   ├── crawler.ts         # 电商平台爬虫
│   ├── aiAnalyzer.ts      # AI 价格分析
│   └── *.test.ts          # 单元测试
├── drizzle/               # 数据库 Schema
│   └── schema.ts
└── shared/                # 共享类型和常量
```

## 数据库设计

### 核心表结构
- **users**：用户表（包含 VIP 状态）
- **products**：商品表（存储商品基本信息）
- **price_history**：价格历史表（记录价格变化）
- **favorites**：收藏表（用户收藏的商品）
- **price_alerts**：降价提醒表（VIP 功能）
- **ai_analysis**：AI 分析缓存表

## 开发指南

### 环境要求
- Node.js 22+
- pnpm 10+
- MySQL 8.0+ 或 TiDB

### 安装依赖
```bash
pnpm install
```

### 数据库迁移
```bash
pnpm db:push
```

### 启动开发服务器
```bash
pnpm dev
```

### 运行测试
```bash
pnpm test
```

### 构建生产版本
```bash
pnpm build
```

## API 路由

### 商品相关
- `product.parse`：解析商品链接
- `product.get`：获取商品详情
- `product.getPriceHistory`：获取价格历史
- `product.analyze`：AI 价格分析
- `product.deepAnalysis`：深度分析（VIP）

### 收藏相关
- `favorite.add`：添加收藏
- `favorite.remove`：取消收藏
- `favorite.list`：获取收藏列表
- `favorite.check`：检查是否已收藏

### 降价提醒（VIP）
- `priceAlert.create`：创建降价提醒
- `priceAlert.list`：获取提醒列表
- `priceAlert.cancel`：取消提醒

## 爬虫说明

当前版本使用模拟数据进行演示。实际生产环境中需要：

1. **实现真实的爬虫逻辑**
   - 使用 Puppeteer/Playwright 模拟浏览器
   - 配置代理 IP 池
   - 添加请求延迟和随机化

2. **或接入第三方数据 API**
   - 慢慢买 API
   - 什么值得买 API
   - 其他价格监控服务

3. **定时任务**
   - 使用 cron 定期更新商品价格
   - 检测降价并触发通知

## VIP 功能开通

用户可以通过以下方式开通 VIP：
1. 访问 VIP 引导页面
2. 扫描微信/支付宝二维码添加客服
3. 联系客服开通 VIP 权限

管理员可以通过数据库直接修改用户的 VIP 状态：
```sql
UPDATE users 
SET isVip = true, vipExpireAt = '2025-12-31 23:59:59' 
WHERE id = <user_id>;
```

## PWA 支持

应用已配置为 PWA，支持：
- ✅ 离线访问
- ✅ 添加到主屏幕
- ✅ 推送通知（降价提醒）
- ✅ 自适应图标

## 部署

### Manus 平台部署
项目已配置为在 Manus 平台上运行，支持：
- 自动数据库配置
- 内置认证系统
- S3 文件存储
- LLM API 集成

### 自定义部署
如需部署到其他平台，请确保：
1. 配置环境变量（数据库、JWT 密钥等）
2. 设置 OAuth 回调 URL
3. 配置 S3 存储（如需要）

## 注意事项

⚠️ **爬虫合规性**
- 遵守各电商平台的 robots.txt 规则
- 控制请求频率，避免对平台造成压力
- 建议使用官方 API 或第三方数据服务

⚠️ **数据准确性**
- 当前版本使用模拟数据，仅供演示
- 实际部署需要接入真实数据源

⚠️ **隐私保护**
- 用户数据加密存储
- 遵守相关隐私法规

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 项目管理员邮箱

---

**价格审判长** - 让每一次购物都更明智 🛍️
