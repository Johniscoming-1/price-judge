import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as crawler from "./crawler";
import * as aiAnalyzer from "./aiAnalyzer";
import * as searchCrawler from "./searchCrawler";

// VIP 权限检查中间件
const vipProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.getUserById(ctx.user.id);
  if (!user?.isVip || (user.vipExpireAt && user.vipExpireAt < new Date())) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "此功能需要 VIP 权限",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // 商品相关
  product: router({
    // 搜索商品（关键字模糊搜索）
    search: publicProcedure
      .input(z.object({
        keyword: z.string().min(1, '请输入搜索关键字'),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        // 使用实时搜索服务，而不是只搜索数据库
        const results = await searchCrawler.searchProducts(input.keyword, input.page, input.pageSize);
        return results;
      }),

    // 解析商品链接
    parse: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input }) => {
        if (!crawler.isValidProductUrl(input.url)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "不支持的商品链接格式。支持京东、淘宝、拼多多、抖音、美团。",
          });
        }

        const productInfo = await crawler.fetchProductInfo(input.url);
        if (!productInfo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "无法获取商品信息，请检查链接是否正确。",
          });
        }

        // 保存商品信息到数据库
        const product = await db.upsertProduct({
          platform: productInfo.platform,
          productId: productInfo.productId,
          productUrl: productInfo.productUrl,
          title: productInfo.title,
          imageUrl: productInfo.imageUrl,
          currentPrice: productInfo.currentPrice,
          originalPrice: productInfo.originalPrice,
          shop: productInfo.shop,
          category: productInfo.category,
          lastFetchedAt: new Date(),
        });

        // 生成并保存历史价格数据
        const mockHistory = crawler.generateMockPriceHistory(productInfo.currentPrice, 30);
        for (const record of mockHistory) {
          await db.insertPriceHistory({
            productId: product.id,
            price: record.price,
            recordedAt: record.date,
          });
        }

        return {
          product,
          platformName: crawler.getPlatformName(productInfo.platform),
        };
      }),

    // 获取商品详情
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "商品不存在",
          });
        }
        return product;
      }),

    // 获取价格历史
    getPriceHistory: publicProcedure
      .input(z.object({
        productId: z.number(),
        days: z.number().optional().default(30),
      }))
      .query(async ({ input, ctx }) => {
        // VIP 用户可以查看更长时间的历史数据
        const user = ctx.user ? await db.getUserById(ctx.user.id) : null;
        const isVip = user?.isVip && (!user.vipExpireAt || user.vipExpireAt >= new Date());
        
        const maxDays = isVip ? input.days : Math.min(input.days, 30);
        const history = await db.getPriceHistory(input.productId, maxDays);
        
        return {
          history,
          isVip,
          maxDays,
        };
      }),

    // AI 价格分析
    analyze: publicProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "商品不存在",
          });
        }

        // 检查是否有缓存的分析结果（1小时内）
        const cached = await db.getLatestAiAnalysis(input.productId);
        if (cached && cached.analyzedAt > new Date(Date.now() - 60 * 60 * 1000)) {
          return {
            status: cached.priceStatus,
            analysis: cached.analysis,
            confidence: cached.confidence ? parseFloat(cached.confidence) : 0,
            cached: true,
          };
        }

        // 获取历史价格数据
        const history = await db.getPriceHistory(input.productId, 30);
        
        // AI 分析
        const result = await aiAnalyzer.analyzePriceTrend(
          product.title,
          product.currentPrice,
          history.map(h => ({ price: h.price, date: h.recordedAt }))
        );

        // 保存分析结果
        await db.saveAiAnalysis({
          productId: input.productId,
          priceStatus: result.status,
          analysis: result.analysis,
          confidence: result.confidence.toString(),
          analyzedAt: new Date(),
        });

        return {
          ...result,
          cached: false,
        };
      }),

    // 深度分析（VIP）
    deepAnalysis: vipProcedure
      .input(z.object({
        productId: z.number(),
        days: z.number().optional().default(90),
      }))
      .mutation(async ({ input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "商品不存在",
          });
        }

        const history = await db.getPriceHistory(input.productId, input.days);
        const report = await aiAnalyzer.generateDeepAnalysis(
          product.title,
          product.currentPrice,
          history.map(h => ({ price: h.price, date: h.recordedAt })),
          crawler.getPlatformName(product.platform)
        );

        return { report };
      }),
  }),

  // 收藏相关
  favorite: router({
    // 添加收藏
    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.addFavorite(ctx.user.id, input.productId);
        return { success: true };
      }),

    // 取消收藏
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.removeFavorite(ctx.user.id, input.productId);
        return { success: true };
      }),

    // 获取收藏列表
    list: protectedProcedure.query(async ({ ctx }) => {
      const favorites = await db.getUserFavorites(ctx.user.id);
      return favorites;
    }),

    // 检查是否已收藏
    check: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input, ctx }) => {
        const isFavorited = await db.isFavorited(ctx.user.id, input.productId);
        return { isFavorited };
      }),
  }),

  // 降价提醒（VIP）
  priceAlert: router({
    // 创建降价提醒
    create: vipProcedure
      .input(z.object({
        productId: z.number(),
        targetPrice: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createPriceAlert({
          userId: ctx.user.id,
          productId: input.productId,
          targetPrice: input.targetPrice,
          isActive: true,
        });
        return { success: true };
      }),

    // 获取用户的降价提醒列表
    list: vipProcedure.query(async ({ ctx }) => {
      const alerts = await db.getUserPriceAlerts(ctx.user.id);
      return alerts;
    }),

    // 取消降价提醒
    cancel: vipProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deactivatePriceAlert(input.alertId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
