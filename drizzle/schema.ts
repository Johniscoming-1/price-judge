import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";

/**
 * 用户表 - 核心认证流程
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isVip: boolean("isVip").default(false).notNull(),
  vipExpireAt: timestamp("vipExpireAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 商品表 - 存储电商平台商品基本信息
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["jd", "taobao", "pinduoduo", "douyin", "meituan"]).notNull(),
  productId: varchar("productId", { length: 128 }).notNull(), // 平台商品ID
  productUrl: text("productUrl").notNull(), // 商品链接
  title: text("title").notNull(), // 商品标题
  imageUrl: text("imageUrl"), // 商品图片
  currentPrice: decimal("currentPrice", { precision: 10, scale: 2 }).notNull(), // 当前价格
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }), // 原价
  shop: text("shop"), // 店铺名称
  category: varchar("category", { length: 128 }), // 商品分类
  lastFetchedAt: timestamp("lastFetchedAt").defaultNow().notNull(), // 最后抓取时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  platformProductIdIdx: index("platform_product_id_idx").on(table.platform, table.productId),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * 价格历史表 - 存储商品历史价格数据
 */
export const priceHistory = mysqlTable("price_history", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
  recordedAtIdx: index("recorded_at_idx").on(table.recordedAt),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * 用户收藏表 - 存储用户收藏的商品
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  userProductIdx: index("user_product_idx").on(table.userId, table.productId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * 降价提醒表 - 存储用户设置的降价提醒
 */
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  targetPrice: decimal("targetPrice", { precision: 10, scale: 2 }).notNull(), // 目标价格
  isActive: boolean("isActive").default(true).notNull(), // 是否激活
  notifiedAt: timestamp("notifiedAt"), // 最后通知时间
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  productIdIdx: index("product_id_idx").on(table.productId),
  isActiveIdx: index("is_active_idx").on(table.isActive),
}));

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * AI 分析记录表 - 缓存 AI 价格分析结果
 */
export const aiAnalysis = mysqlTable("ai_analysis", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  priceStatus: mysqlEnum("priceStatus", ["high", "reasonable", "low"]).notNull(), // 价格状态
  analysis: text("analysis").notNull(), // AI 分析内容
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 置信度
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
}, (table) => ({
  productIdIdx: index("product_id_idx").on(table.productId),
}));

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalysis.$inferInsert;
