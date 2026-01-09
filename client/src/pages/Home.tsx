import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingDown, TrendingUp, Minus, ShoppingBag, Star, Bell, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();
  
  const parseMutation = trpc.product.parse.useMutation({
    onSuccess: (data) => {
      toast.success("商品解析成功！");
      setLocation(`/product/${data.product.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("请输入商品链接");
      return;
    }
    parseMutation.mutate({ url: url.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container py-12 md:py-20">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <ShoppingBag className="w-4 h-4" />
            智能价格分析工具
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            价格审判长
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            支持京东、淘宝、拼多多、抖音、美团等主流电商平台
            <br />
            AI 智能分析价格趋势，助您做出明智的购物决策
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-3xl mx-auto shadow-lg border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="url"
                placeholder="粘贴商品链接（支持京东、淘宝、拼多多、抖音、美团）"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-12 text-base"
                disabled={parseMutation.isPending}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="px-8"
                disabled={parseMutation.isPending}
              >
                {parseMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    解析中...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    查询价格
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">支持平台：</span>
              <Badge variant="secondary">京东</Badge>
              <Badge variant="secondary">淘宝</Badge>
              <Badge variant="secondary">拼多多</Badge>
              <Badge variant="secondary">抖音</Badge>
              <Badge variant="secondary">美团</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>历史价格追踪</CardTitle>
              <CardDescription>
                查看商品 30 天历史价格曲线，了解价格波动趋势
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>AI 智能分析</CardTitle>
              <CardDescription>
                AI 分析价格是否合理，给出专业的购买建议
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle>商品收藏</CardTitle>
              <CardDescription>
                收藏感兴趣的商品，随时查看价格变化
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* VIP Features */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">VIP 专属功能</h2>
            <p className="text-muted-foreground">解锁更多强大功能，让购物更智能</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  深度价格分析
                  <Badge variant="default" className="ml-auto">VIP</Badge>
                </CardTitle>
                <CardDescription>
                  查看 90/180 天历史数据，获取更详细的价格趋势分析报告
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  降价提醒
                  <Badge variant="default" className="ml-auto">VIP</Badge>
                </CardTitle>
                <CardDescription>
                  设置目标价格，降价时自动推送通知，不错过任何优惠
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  消费报告
                  <Badge variant="default" className="ml-auto">VIP</Badge>
                </CardTitle>
                <CardDescription>
                  生成详细的商品分析报告，包括价格历史、评价对比等
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Price Status Examples */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">AI 价格判断示例</h3>
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-destructive" />
                  <div className="flex-1">
                    <div className="font-semibold text-destructive mb-1">价格偏高</div>
                    <p className="text-sm text-muted-foreground">
                      当前价格高于历史平均价格 15% 以上，建议等待降价
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Minus className="w-8 h-8 text-warning" />
                  <div className="flex-1">
                    <div className="font-semibold text-warning mb-1">价格合理</div>
                    <p className="text-sm text-muted-foreground">
                      当前价格与历史平均价格相差不大，可根据需求购买
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-8 h-8 text-success" />
                  <div className="flex-1">
                    <div className="font-semibold text-success mb-1">价格较低</div>
                    <p className="text-sm text-muted-foreground">
                      当前价格低于历史平均价格 15% 以上，建议尽快购买
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>价格审判长 - 让每一次购物都更明智</p>
          <p className="mt-2">支持京东、淘宝、拼多多、抖音、美团等主流电商平台</p>
        </div>
      </footer>
    </div>
  );
}
