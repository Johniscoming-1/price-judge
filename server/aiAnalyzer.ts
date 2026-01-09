/**
 * AI 价格分析服务
 * 使用 LLM 分析商品价格趋势，给出购买建议
 */

import { invokeLLM } from "./_core/llm";

export type PriceStatus = 'high' | 'reasonable' | 'low';

export interface PriceAnalysisResult {
  status: PriceStatus;
  analysis: string;
  confidence: number;
  recommendation: string;
}

export interface PriceDataPoint {
  price: string;
  date: Date;
}

/**
 * 分析价格趋势
 */
export async function analyzePriceTrend(
  productTitle: string,
  currentPrice: string,
  priceHistory: PriceDataPoint[]
): Promise<PriceAnalysisResult> {
  // 计算价格统计数据
  const prices = priceHistory.map(p => parseFloat(p.price));
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const current = parseFloat(currentPrice);
  
  // 计算价格偏离度
  const deviation = ((current - avgPrice) / avgPrice) * 100;
  
  // 构建分析提示词
  const prompt = `你是一位专业的电商价格分析师，请分析以下商品的价格情况：

商品名称：${productTitle}
当前价格：¥${currentPrice}
历史价格统计（最近${priceHistory.length}天）：
- 平均价格：¥${avgPrice.toFixed(2)}
- 最高价格：¥${maxPrice.toFixed(2)}
- 最低价格：¥${minPrice.toFixed(2)}
- 价格偏离度：${deviation.toFixed(2)}%

请分析当前价格是否合理，并给出购买建议。

要求：
1. 判断价格状态：high（价格偏高）、reasonable（价格合理）、low（价格较低）
2. 给出详细的分析理由（50-100字）
3. 给出购买建议（30-50字）
4. 给出分析置信度（0-100）

请以JSON格式返回结果：
{
  "status": "high|reasonable|low",
  "analysis": "价格分析理由",
  "recommendation": "购买建议",
  "confidence": 85
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "你是一位专业的电商价格分析师，擅长分析商品价格趋势并给出购买建议。" },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "price_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["high", "reasonable", "low"],
                description: "价格状态：high（偏高）、reasonable（合理）、low（较低）"
              },
              analysis: {
                type: "string",
                description: "价格分析理由，50-100字"
              },
              recommendation: {
                type: "string",
                description: "购买建议，30-50字"
              },
              confidence: {
                type: "number",
                description: "分析置信度，0-100"
              }
            },
            required: ["status", "analysis", "recommendation", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 分析返回空结果");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentStr) as PriceAnalysisResult;
    return result;
  } catch (error) {
    console.error('[AI Analyzer] Failed to analyze price:', error);
    
    // 降级策略：使用基于规则的分析
    return fallbackAnalysis(current, avgPrice, minPrice, maxPrice, deviation);
  }
}

/**
 * 降级分析策略（当 AI 不可用时）
 */
function fallbackAnalysis(
  current: number,
  avgPrice: number,
  minPrice: number,
  maxPrice: number,
  deviation: number
): PriceAnalysisResult {
  let status: PriceStatus;
  let analysis: string;
  let recommendation: string;
  let confidence: number;

  if (deviation > 15) {
    status = 'high';
    analysis = `当前价格比历史平均价格高出 ${deviation.toFixed(1)}%，处于较高水平。建议等待降价或查看其他渠道。`;
    recommendation = '建议等待降价或对比其他平台价格后再购买。';
    confidence = 75;
  } else if (deviation < -15) {
    status = 'low';
    analysis = `当前价格比历史平均价格低 ${Math.abs(deviation).toFixed(1)}%，是近期较低价格。如有需求可以考虑入手。`;
    recommendation = '价格处于低位，如有需求建议尽快购买。';
    confidence = 80;
  } else {
    status = 'reasonable';
    analysis = `当前价格与历史平均价格相差 ${Math.abs(deviation).toFixed(1)}%，价格波动在正常范围内。`;
    recommendation = '价格合理，可根据实际需求决定是否购买。';
    confidence = 70;
  }

  return { status, analysis, recommendation, confidence };
}

/**
 * 生成深度价格分析报告（VIP 功能）
 */
export async function generateDeepAnalysis(
  productTitle: string,
  currentPrice: string,
  priceHistory: PriceDataPoint[],
  platform: string
): Promise<string> {
  const prices = priceHistory.map(p => parseFloat(p.price));
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  
  // 计算价格趋势
  const recentPrices = prices.slice(-7); // 最近7天
  const trend = recentPrices[recentPrices.length - 1] - recentPrices[0];
  const trendPercent = (trend / recentPrices[0]) * 100;
  
  const prompt = `作为专业的电商价格分析师，请为以下商品生成详细的价格分析报告：

商品信息：
- 商品名称：${productTitle}
- 销售平台：${platform}
- 当前价格：¥${currentPrice}

价格统计（${priceHistory.length}天数据）：
- 平均价格：¥${avgPrice.toFixed(2)}
- 最高价格：¥${maxPrice.toFixed(2)}
- 最低价格：¥${minPrice.toFixed(2)}
- 近7天趋势：${trendPercent > 0 ? '上涨' : '下降'} ${Math.abs(trendPercent).toFixed(2)}%

请生成一份详细的分析报告，包括：
1. 价格走势总结
2. 价格波动分析
3. 最佳购买时机建议
4. 价格预测（未来7-14天）
5. 同类商品对比建议

报告要求：
- 专业、客观、实用
- 使用 Markdown 格式
- 总字数 300-500 字`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "你是一位资深的电商价格分析师，擅长生成专业的价格分析报告。" },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return '报告生成失败';
    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch (error) {
    console.error('[AI Analyzer] Failed to generate deep analysis:', error);
    return '深度分析报告生成失败，请稍后重试。';
  }
}
