/**
 * 电商平台实时搜索服务
 * 支持搜索任何商品（外卖、酒店、电子产品等）
 * 
 * 注意：由于电商平台的反爬虫机制，实际生产环境建议：
 * 1. 接入第三方数据API（慢慢买、什么值得买等）
 * 2. 使用代理IP池和浏览器自动化
 * 3. 遵守robots.txt和平台服务条款
 * 
 * 当前实现为演示版本，使用模拟搜索结果
 */

import type { Platform } from './crawler';

export interface SearchProduct {
  platform: Platform;
  productId: string;
  productUrl: string;
  title: string;
  imageUrl?: string;
  currentPrice: string;
  originalPrice?: string;
  shop?: string;
  category?: string;
  sales?: number; // 销量
  rating?: number; // 评分
}

export interface SearchResult {
  products: SearchProduct[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 生成模拟搜索结果
 * 实际生产环境应该调用真实的电商平台搜索API
 */
function generateMockSearchResults(keyword: string, page: number, pageSize: number): SearchResult {
  const allProducts: SearchProduct[] = [];
  
  // 根据关键词生成不同类型的商品
  const categories = detectCategory(keyword);
  
  categories.forEach(category => {
    const products = generateProductsByCategory(keyword, category);
    allProducts.push(...products);
  });
  
  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedProducts = allProducts.slice(start, end);
  
  return {
    products: paginatedProducts,
    total: allProducts.length,
    page,
    pageSize,
    hasMore: end < allProducts.length,
  };
}

/**
 * 检测搜索关键词的商品类别
 */
function detectCategory(keyword: string): string[] {
  const kw = keyword.toLowerCase();
  const categories: string[] = [];
  
  // 手机相关
  if (kw.includes('手机') || kw.includes('iphone') || kw.includes('小米') || 
      kw.includes('华为') || kw.includes('oppo') || kw.includes('vivo') ||
      kw.includes('荣耀') || kw.includes('三星')) {
    categories.push('phone');
  }
  
  // 电脑相关
  if (kw.includes('电脑') || kw.includes('笔记本') || kw.includes('macbook') ||
      kw.includes('thinkpad') || kw.includes('戴尔') || kw.includes('联想')) {
    categories.push('computer');
  }
  
  // 耳机相关
  if (kw.includes('耳机') || kw.includes('airpods') || kw.includes('降噪')) {
    categories.push('earphone');
  }
  
  // 外卖相关
  if (kw.includes('外卖') || kw.includes('美食') || kw.includes('餐饮') ||
      kw.includes('快餐') || kw.includes('火锅') || kw.includes('奶茶')) {
    categories.push('food');
  }
  
  // 酒店相关
  if (kw.includes('酒店') || kw.includes('住宿') || kw.includes('民宿') ||
      kw.includes('旅馆') || kw.includes('宾馆')) {
    categories.push('hotel');
  }
  
  // 家电相关
  if (kw.includes('冰箱') || kw.includes('洗衣机') || kw.includes('空调') ||
      kw.includes('电视') || kw.includes('家电')) {
    categories.push('appliance');
  }
  
  // 如果没有匹配到任何类别，返回通用类别
  if (categories.length === 0) {
    categories.push('general');
  }
  
  return categories;
}

/**
 * 根据类别生成商品数据
 */
function generateProductsByCategory(keyword: string, category: string): SearchProduct[] {
  const products: SearchProduct[] = [];
  const platforms: Platform[] = ['jd', 'taobao', 'pinduoduo', 'douyin', 'meituan'];
  
  switch (category) {
    case 'phone':
      products.push(
        {
          platform: 'jd',
          productId: `jd-${Date.now()}-1`,
          productUrl: 'https://item.jd.com/100012345678.html',
          title: `Apple iPhone 15 Pro Max 256GB ${keyword}`,
          imageUrl: 'https://img14.360buyimg.com/n1/s450x450_jfs/t1/placeholder.jpg',
          currentPrice: '9999.00',
          originalPrice: '10999.00',
          shop: 'Apple官方旗舰店',
          category: '手机通讯',
          sales: 50000,
          rating: 4.9,
        },
        {
          platform: 'taobao',
          productId: `tb-${Date.now()}-2`,
          productUrl: 'https://item.taobao.com/item.htm?id=123456789',
          title: `小米14 Ultra 相关 ${keyword}`,
          imageUrl: 'https://img.alicdn.com/bao/uploaded/placeholder.jpg',
          currentPrice: '6499.00',
          originalPrice: '6999.00',
          shop: '小米官方旗舰店',
          category: '手机通讯',
          sales: 30000,
          rating: 4.8,
        },
        {
          platform: 'pinduoduo',
          productId: `pdd-${Date.now()}-3`,
          productUrl: 'https://mobile.yangkeduo.com/goods.html?goods_id=123456',
          title: `华为 Mate 60 Pro ${keyword}`,
          imageUrl: 'https://img.pddpic.com/placeholder.jpg',
          currentPrice: '6999.00',
          originalPrice: '7999.00',
          shop: '华为官方旗舰店',
          category: '手机通讯',
          sales: 25000,
          rating: 4.7,
        }
      );
      break;
      
    case 'computer':
      products.push(
        {
          platform: 'jd',
          productId: `jd-${Date.now()}-4`,
          productUrl: 'https://item.jd.com/100012345679.html',
          title: `Apple MacBook Pro 14英寸 M3 ${keyword}`,
          imageUrl: 'https://img14.360buyimg.com/n1/s450x450_jfs/t1/placeholder2.jpg',
          currentPrice: '15999.00',
          originalPrice: '17999.00',
          shop: 'Apple官方旗舰店',
          category: '电脑办公',
          sales: 8000,
          rating: 4.9,
        },
        {
          platform: 'taobao',
          productId: `tb-${Date.now()}-5`,
          productUrl: 'https://item.taobao.com/item.htm?id=123456790',
          title: `联想ThinkPad X1 Carbon ${keyword}`,
          imageUrl: 'https://img.alicdn.com/bao/uploaded/placeholder2.jpg',
          currentPrice: '12999.00',
          originalPrice: '14999.00',
          shop: '联想官方旗舰店',
          category: '电脑办公',
          sales: 5000,
          rating: 4.8,
        }
      );
      break;
      
    case 'earphone':
      products.push(
        {
          platform: 'jd',
          productId: `jd-${Date.now()}-6`,
          productUrl: 'https://item.jd.com/100012345680.html',
          title: `AirPods Pro 2代 主动降噪 ${keyword}`,
          imageUrl: 'https://img14.360buyimg.com/n1/s450x450_jfs/t1/placeholder3.jpg',
          currentPrice: '1899.00',
          originalPrice: '1999.00',
          shop: 'Apple官方旗舰店',
          category: '影音娱乐',
          sales: 15000,
          rating: 4.9,
        },
        {
          platform: 'taobao',
          productId: `tb-${Date.now()}-7`,
          productUrl: 'https://item.taobao.com/item.htm?id=123456791',
          title: `Sony WH-1000XM5 无线降噪 ${keyword}`,
          imageUrl: 'https://img.alicdn.com/bao/uploaded/placeholder3.jpg',
          currentPrice: '2299.00',
          originalPrice: '2799.00',
          shop: 'Sony官方旗舰店',
          category: '影音娱乐',
          sales: 12000,
          rating: 4.8,
        }
      );
      break;
      
    case 'food':
      products.push(
        {
          platform: 'meituan',
          productId: `mt-${Date.now()}-8`,
          productUrl: 'https://www.meituan.com/deal/123456',
          title: `海底捞火锅 ${keyword} 双人套餐`,
          imageUrl: 'https://p0.meituan.net/placeholder.jpg',
          currentPrice: '168.00',
          originalPrice: '298.00',
          shop: '海底捞火锅(万达店)',
          category: '美食外卖',
          sales: 5000,
          rating: 4.7,
        },
        {
          platform: 'meituan',
          productId: `mt-${Date.now()}-9`,
          productUrl: 'https://www.meituan.com/deal/123457',
          title: `喜茶 ${keyword} 多肉葡萄`,
          imageUrl: 'https://p0.meituan.net/placeholder2.jpg',
          currentPrice: '19.90',
          originalPrice: '25.00',
          shop: '喜茶(国贸店)',
          category: '美食外卖',
          sales: 10000,
          rating: 4.8,
        },
        {
          platform: 'douyin',
          productId: `dy-${Date.now()}-10`,
          productUrl: 'https://www.douyin.com/product/123456',
          title: `麦当劳 ${keyword} 超值套餐`,
          imageUrl: 'https://p3.douyinpic.com/placeholder.jpg',
          currentPrice: '29.90',
          originalPrice: '45.00',
          shop: '麦当劳(中关村店)',
          category: '美食外卖',
          sales: 8000,
          rating: 4.6,
        }
      );
      break;
      
    case 'hotel':
      products.push(
        {
          platform: 'meituan',
          productId: `mt-${Date.now()}-11`,
          productUrl: 'https://www.meituan.com/deal/123458',
          title: `北京希尔顿酒店 ${keyword} 豪华大床房`,
          imageUrl: 'https://p0.meituan.net/placeholder3.jpg',
          currentPrice: '688.00',
          originalPrice: '1288.00',
          shop: '北京希尔顿酒店',
          category: '酒店住宿',
          sales: 2000,
          rating: 4.8,
        },
        {
          platform: 'meituan',
          productId: `mt-${Date.now()}-12`,
          productUrl: 'https://www.meituan.com/deal/123459',
          title: `如家酒店 ${keyword} 标准间`,
          imageUrl: 'https://p0.meituan.net/placeholder4.jpg',
          currentPrice: '199.00',
          originalPrice: '299.00',
          shop: '如家酒店(国贸店)',
          category: '酒店住宿',
          sales: 5000,
          rating: 4.5,
        }
      );
      break;
      
    case 'appliance':
      products.push(
        {
          platform: 'jd',
          productId: `jd-${Date.now()}-13`,
          productUrl: 'https://item.jd.com/100012345681.html',
          title: `海尔冰箱 ${keyword} 双开门 500L`,
          imageUrl: 'https://img14.360buyimg.com/n1/s450x450_jfs/t1/placeholder4.jpg',
          currentPrice: '3999.00',
          originalPrice: '4999.00',
          shop: '海尔官方旗舰店',
          category: '家用电器',
          sales: 3000,
          rating: 4.7,
        },
        {
          platform: 'taobao',
          productId: `tb-${Date.now()}-14`,
          productUrl: 'https://item.taobao.com/item.htm?id=123456792',
          title: `格力空调 ${keyword} 1.5匹 变频`,
          imageUrl: 'https://img.alicdn.com/bao/uploaded/placeholder4.jpg',
          currentPrice: '2899.00',
          originalPrice: '3599.00',
          shop: '格力官方旗舰店',
          category: '家用电器',
          sales: 4000,
          rating: 4.8,
        }
      );
      break;
      
    default:
      // 通用商品
      products.push(
        {
          platform: 'jd',
          productId: `jd-${Date.now()}-15`,
          productUrl: 'https://item.jd.com/100012345682.html',
          title: `${keyword} - 京东精选商品`,
          imageUrl: 'https://img14.360buyimg.com/n1/s450x450_jfs/t1/placeholder5.jpg',
          currentPrice: '99.00',
          originalPrice: '199.00',
          shop: '京东自营',
          category: '综合',
          sales: 1000,
          rating: 4.5,
        },
        {
          platform: 'taobao',
          productId: `tb-${Date.now()}-16`,
          productUrl: 'https://item.taobao.com/item.htm?id=123456793',
          title: `${keyword} - 淘宝热卖商品`,
          imageUrl: 'https://img.alicdn.com/bao/uploaded/placeholder5.jpg',
          currentPrice: '89.00',
          originalPrice: '179.00',
          shop: '淘宝精选',
          category: '综合',
          sales: 1500,
          rating: 4.6,
        },
        {
          platform: 'pinduoduo',
          productId: `pdd-${Date.now()}-17`,
          productUrl: 'https://mobile.yangkeduo.com/goods.html?goods_id=123458',
          title: `${keyword} - 拼多多百亿补贴`,
          imageUrl: 'https://img.pddpic.com/placeholder3.jpg',
          currentPrice: '79.00',
          originalPrice: '159.00',
          shop: '拼多多官方',
          category: '综合',
          sales: 2000,
          rating: 4.4,
        }
      );
  }
  
  return products;
}

/**
 * 搜索商品（主入口）
 */
export async function searchProducts(
  keyword: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  try {
    // 实际生产环境应该调用真实的电商平台API
    // 这里使用模拟数据演示
    const result = generateMockSearchResults(keyword, page, pageSize);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return result;
  } catch (error) {
    console.error('[SearchCrawler] Search failed:', error);
    throw new Error('搜索失败，请稍后重试');
  }
}
