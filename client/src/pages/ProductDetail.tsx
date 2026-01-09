import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, ExternalLink, Heart, TrendingDown, TrendingUp, 
  Minus, Sparkles, Lock, Bell, FileText, Star
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const productId = parseInt(id || "0");

  // 查询商品信息
  const { data: product, isLoading: productLoading } = trpc.product.get.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  // 查询价格历史
  const { data: priceData, isLoading: historyLoading } = trpc.product.getPriceHistory.useQuery(
    { productId, days: 30 },
    { enabled: !!productId }
  );

  // AI 分析
  const analyzeMutation = trpc.product.analyze.useMutation();

  // 收藏相关
  const { data: favoriteStatus } = trpc.favorite.check.useQuery(
    { productId },
    { enabled: isAuthenticated && !!productId }
  );
  
  const utils = trpc.useUtils();
  const addFavoriteMutation = trpc.favorite.add.useMutation({
    onSuccess: () => {
      toast.success("收藏成功！");
      utils.favorite.check.invalidate({ productId });
      utils.favorite.list.invalidate();
    },
  });

  const removeFavoriteMutation = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      toast.success("已取消收藏");
      utils.favorite.check.invalidate({ productId });
      utils.favorite.list.invalidate();
    },
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate({ productId });
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      window.location.href = getLoginUrl();
      return;
    }

    if (favoriteStatus?.isFavorited) {
      removeFavoriteMutation.mutate({ productId });
    } else {
      addFavoriteMutation.mutate({ productId });
    }
  };

  if (productLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>商品不存在</CardTitle>
            <CardDescription>未找到该商品信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 准备图表数据
  const chartData = priceData?.history.map(h => ({
    date: format(new Date(h.recordedAt), "MM-dd", { locale: zhCN }),
    price: parseFloat(h.price),
  })) || [];

  const currentPrice = parseFloat(product.currentPrice);
  const prices = chartData.map(d => d.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : currentPrice;
  const minPrice = prices.length > 0 ? Math.min(...prices) : currentPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : currentPrice;

  // 价格状态图标
  const getPriceStatusIcon = (status: string) => {
    switch (status) {
      case "high":
        return <TrendingUp className="w-6 h-6 text-destructive" />;
      case "low":
        return <TrendingDown className="w-6 h-6 text-success" />;
      default:
        return <Minus className="w-6 h-6 text-warning" />;
    }
  };

  const getPriceStatusText = (status: string) => {
    switch (status) {
      case "high":
        return { text: "价格偏高", color: "text-destructive" };
      case "low":
        return { text: "价格较低", color: "text-success" };
      default:
        return { text: "价格合理", color: "text-warning" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 主要内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 商品基本信息 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold">{product.title}</h1>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleFavorite}
                        disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favoriteStatus?.isFavorited
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary">{product.platform.toUpperCase()}</Badge>
                      {product.shop && (
                        <span className="text-sm text-muted-foreground">{product.shop}</span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-primary">
                        ¥{product.currentPrice}
                      </span>
                      {product.originalPrice && parseFloat(product.originalPrice) > currentPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.open(product.productUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      查看商品详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 价格历史图表 */}
            <Card>
              <CardHeader>
                <CardTitle>价格历史趋势</CardTitle>
                <CardDescription>
                  最近 {priceData?.maxDays || 30} 天价格变化
                  {!priceData?.isVip && (
                    <span className="ml-2 text-primary">（VIP 可查看更长时间）</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [`¥${value.toFixed(2)}`, "价格"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">平均价格</div>
                    <div className="text-xl font-semibold">¥{avgPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">最低价格</div>
                    <div className="text-xl font-semibold text-success">¥{minPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">最高价格</div>
                    <div className="text-xl font-semibold text-destructive">¥{maxPrice.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI 分析结果 */}
            {analyzeMutation.data && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle>AI 价格分析</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    {getPriceStatusIcon(analyzeMutation.data.status)}
                    <div className="flex-1">
                      <div className={`text-xl font-semibold mb-2 ${getPriceStatusText(analyzeMutation.data.status).color}`}>
                        {getPriceStatusText(analyzeMutation.data.status).text}
                      </div>
                      <p className="text-muted-foreground">{analyzeMutation.data.analysis}</p>
                      {'recommendation' in analyzeMutation.data && analyzeMutation.data.recommendation && (
                        <Alert className="mt-4">
                          <AlertDescription>
                            <strong>购买建议：</strong>{analyzeMutation.data.recommendation}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  {analyzeMutation.data.cached && (
                    <p className="text-xs text-muted-foreground">
                      * 分析结果已缓存，每小时更新一次
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* AI 分析按钮 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI 智能分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? "分析中..." : "开始分析"}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  AI 将分析价格历史数据，给出专业的购买建议
                </p>
              </CardContent>
            </Card>

            {/* VIP 功能 */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  VIP 专属功能
                </CardTitle>
                <CardDescription>解锁更多强大功能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">深度价格分析</div>
                    <div className="text-xs text-muted-foreground">90/180天数据</div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Bell className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">降价提醒</div>
                    <div className="text-xs text-muted-foreground">实时推送通知</div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">消费报告</div>
                    <div className="text-xs text-muted-foreground">详细分析报告</div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>

                <Button variant="default" className="w-full mt-4" onClick={() => setLocation("/vip")}>
                  开通 VIP
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
