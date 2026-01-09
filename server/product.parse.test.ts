import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("product.parse", () => {
  it("should reject invalid URL format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.product.parse({ url: "not-a-valid-url" })
    ).rejects.toThrow();
  });

  it("should reject unsupported platform URL", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.product.parse({ url: "https://www.amazon.com/product/123" })
    ).rejects.toThrow("不支持的商品链接格式");
  });

  it("should parse JD.com product URL successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.parse({
      url: "https://item.jd.com/100012345678.html"
    });

    expect(result).toBeDefined();
    expect(result.product).toBeDefined();
    expect(result.product.platform).toBe("jd");
    expect(result.product.productId).toBe("100012345678");
    expect(result.platformName).toBe("京东");
  });

  it("should parse Taobao product URL successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.parse({
      url: "https://item.taobao.com/item.htm?id=123456789"
    });

    expect(result).toBeDefined();
    expect(result.product).toBeDefined();
    expect(result.product.platform).toBe("taobao");
    expect(result.product.productId).toBe("123456789");
    expect(result.platformName).toBe("淘宝");
  });

  it("should parse Pinduoduo product URL successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.product.parse({
      url: "https://mobile.yangkeduo.com/goods.html?goods_id=123456789"
    });

    expect(result).toBeDefined();
    expect(result.product).toBeDefined();
    expect(result.product.platform).toBe("pinduoduo");
    expect(result.product.productId).toBe("123456789");
    expect(result.platformName).toBe("拼多多");
  });
});

describe("product.get", () => {
  it("should return 404 for non-existent product", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.product.get({ id: 999999 })
    ).rejects.toThrow("商品不存在");
  });
});

describe("favorite operations", () => {
  it("should require authentication to add favorite", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorite.add({ productId: 1 })
    ).rejects.toThrow();
  });

  it("should require authentication to list favorites", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.favorite.list()
    ).rejects.toThrow();
  });

  it("should allow authenticated users to list favorites", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.favorite.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
