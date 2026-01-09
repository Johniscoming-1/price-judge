import { eq, and, desc, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  products, InsertProduct, Product,
  priceHistory, InsertPriceHistory,
  favorites, InsertFavorite,
  priceAlerts, InsertPriceAlert,
  aiAnalysis, InsertAiAnalysis
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== 用户相关 ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== 商品相关 ====================

export async function upsertProduct(product: InsertProduct): Promise<Product> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.platform, product.platform),
        eq(products.productId, product.productId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const updated = {
      ...product,
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    };
    await db
      .update(products)
      .set(updated)
      .where(eq(products.id, existing[0].id));
    return { ...existing[0], ...updated };
  } else {
    const result = await db.insert(products).values(product);
    const insertId = Number(result[0].insertId);
    const newProduct = await db.select().from(products).where(eq(products.id, insertId)).limit(1);
    return newProduct[0];
  }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductByPlatformId(platform: string, productId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.platform, platform as any),
        eq(products.productId, productId)
      )
    )
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== 价格历史相关 ====================

export async function insertPriceHistory(history: InsertPriceHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(priceHistory).values(history);
}

export async function getPriceHistory(productId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  
  return db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.productId, productId),
        gte(priceHistory.recordedAt, daysAgo)
      )
    )
    .orderBy(priceHistory.recordedAt);
}

// ==================== 收藏相关 ====================

export async function addFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.productId, productId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  await db.insert(favorites).values({ userId, productId });
  return { userId, productId };
}

export async function removeFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.productId, productId)
      )
    );
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: favorites.id,
      productId: favorites.productId,
      createdAt: favorites.createdAt,
      product: products,
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}

export async function isFavorited(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.productId, productId)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

// ==================== 降价提醒相关 ====================

export async function createPriceAlert(alert: InsertPriceAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(priceAlerts).values(alert);
}

export async function getUserPriceAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(priceAlerts)
    .where(
      and(
        eq(priceAlerts.userId, userId),
        eq(priceAlerts.isActive, true)
      )
    )
    .orderBy(desc(priceAlerts.createdAt));
}

export async function deactivatePriceAlert(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(priceAlerts)
    .set({ isActive: false })
    .where(eq(priceAlerts.id, alertId));
}

// ==================== AI 分析相关 ====================

export async function saveAiAnalysis(analysis: InsertAiAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(aiAnalysis).values(analysis);
}

export async function getLatestAiAnalysis(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(aiAnalysis)
    .where(eq(aiAnalysis.productId, productId))
    .orderBy(desc(aiAnalysis.analyzedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
