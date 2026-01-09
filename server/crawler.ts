/**
 * 电商平台爬虫服务
 * 负责解析商品链接、抓取价格数据
 * 
 * 注意：由于中国电商平台的反爬虫机制较强，实际生产环境中需要：
 * 1. 使用代理 IP 池
 * 2. 模拟真实浏览器行为
 * 3. 添加请求延迟和随机化
 * 4. 使用第三方数据API（如慢慢买、什么值得买等）
 * 
 * 当前实现为演示版本，使用模拟数据和基础解析逻辑
 */

import axios from 'axios';

export type Platform = 'jd' | 'taobao' | 'pinduoduo' | 'douyin' | 'meituan';

export interface ProductInfo {
  platform: Platform;
  productId: string;
  productUrl: string;
  title: string;
  imageUrl?: string;
  currentPrice: string;
  originalPrice?: string;
  shop?: string;
  category?: string;
}

/**
 * 从商品链接中提取平台和商品ID
 */
export function parseProductUrl(url: string): { platform: Platform; productId: string } | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // 京东
    if (hostname.includes('jd.com')) {
      // 匹配 item.jd.com/123456.html 或 item.m.jd.com/product/123456.html
      const match = url.match(/\/(\d+)\.html/) || url.match(/product\/(\d+)/);
      if (match && match[1]) {
        return { platform: 'jd', productId: match[1] };
      }
    }
    
    // 淘宝/天猫
    if (hostname.includes('taobao.com') || hostname.includes('tmall.com')) {
      // 匹配 id=123456 参数
      const match = url.match(/[?&]id=(\d+)/);
      if (match && match[1]) {
        return { platform: 'taobao', productId: match[1] };
      }
    }
    
    // 拼多多
    if (hostname.includes('pinduoduo.com') || hostname.includes('yangkeduo.com')) {
      // 匹配 goods_id=123456 或 goods/123456
      const match = url.match(/goods_id=(\d+)/) || url.match(/goods\/(\d+)/);
      if (match && match[1]) {
        return { platform: 'pinduoduo', productId: match[1] };
      }
    }
    
    // 抖音
    if (hostname.includes('douyin.com')) {
      // 匹配商品ID
      const match = url.match(/product\/(\d+)/);
      if (match && match[1]) {
        return { platform: 'douyin', productId: match[1] };
      }
    }
    
    // 美团
    if (hostname.includes('meituan.com')) {
      // 匹配商品ID
      const match = url.match(/deal\/(\d+)/);
      if (match && match[1]) {
        return { platform: 'meituan', productId: match[1] };
      }
    }
    
    return null;
  } catch (error) {
    console.error('[Crawler] Failed to parse URL:', error);
    return null;
  }
}

/**
 * 抓取商品信息（演示版本 - 使用模拟数据）
 * 实际生产环境需要实现真实的爬虫逻辑或接入第三方API
 */
export async function fetchProductInfo(url: string): Promise<ProductInfo | null> {
  const parsed = parseProductUrl(url);
  if (!parsed) {
    throw new Error('无法识别的商品链接格式');
  }
  
  const { platform, productId } = parsed;
  
  // 演示版本：返回模拟数据
  // 实际生产环境需要实现真实的爬虫逻辑
  return generateMockProductInfo(platform, productId, url);
}

/**
 * 生成模拟商品数据（用于演示）
 */
function generateMockProductInfo(
  platform: Platform,
  productId: string,
  url: string
): ProductInfo {
  const platformNames = {
    jd: '京东',
    taobao: '淘宝',
    pinduoduo: '拼多多',
    douyin: '抖音',
    meituan: '美团',
  };
  
  const categories = ['数码电器', '家居生活', '服饰鞋包', '美妆个护', '食品饮料', '图书音像'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // 生成随机价格（100-5000元）
  const currentPrice = (Math.random() * 4900 + 100).toFixed(2);
  const originalPrice = (parseFloat(currentPrice) * (1 + Math.random() * 0.5)).toFixed(2);
  
  return {
    platform,
    productId,
    productUrl: url,
    title: `【${platformNames[platform]}】${randomCategory}商品示例 - 商品ID: ${productId}`,
    imageUrl: `https://via.placeholder.com/400x400.png?text=${platformNames[platform]}+Product`,
    currentPrice,
    originalPrice,
    shop: `${platformNames[platform]}官方旗舰店`,
    category: randomCategory,
  };
}

/**
 * 生成模拟历史价格数据
 */
export function generateMockPriceHistory(currentPrice: string, days: number = 30): Array<{
  price: string;
  date: Date;
}> {
  const history: Array<{ price: string; date: Date }> = [];
  const basePrice = parseFloat(currentPrice);
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // 生成价格波动（±20%）
    const fluctuation = (Math.random() - 0.5) * 0.4;
    const price = (basePrice * (1 + fluctuation)).toFixed(2);
    
    history.push({ price, date });
  }
  
  return history;
}

/**
 * 验证商品链接格式
 */
export function isValidProductUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    const supportedDomains = [
      'jd.com',
      'taobao.com',
      'tmall.com',
      'pinduoduo.com',
      'yangkeduo.com',
      'douyin.com',
      'meituan.com',
    ];
    
    return supportedDomains.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * 获取平台名称（中文）
 */
export function getPlatformName(platform: Platform): string {
  const names: Record<Platform, string> = {
    jd: '京东',
    taobao: '淘宝',
    pinduoduo: '拼多多',
    douyin: '抖音',
    meituan: '美团',
  };
  return names[platform];
}
