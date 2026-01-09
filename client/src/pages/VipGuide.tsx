import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Check, TrendingUp, Bell, FileText, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function VipGuide() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              升级 VIP 会员
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              解锁更多
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                强大功能
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              成为 VIP 会员，享受专业级价格分析服务
            </p>
          </div>

          {/* Features Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>免费版</CardTitle>
                <CardDescription>基础价格查询功能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>商品链接解析</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>30 天历史价格</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>基础 AI 价格分析</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <span>商品收藏功能</span>
                </div>
              </CardContent>
            </Card>

            {/* VIP Plan */}
            <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-primary to-accent text-white px-4 py-1 text-sm font-medium">
                推荐
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  VIP 会员
                </CardTitle>
                <CardDescription>专业级价格分析服务</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span className="font-medium">包含所有免费功能</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>90/180 天历史数据</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>深度 AI 价格分析</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>降价实时推送通知</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>详细消费分析报告</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">开通 VIP 会员</CardTitle>
              <CardDescription>扫描下方二维码添加客服微信/支付宝开通</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* WeChat QR Code */}
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-primary/20 flex items-center justify-center mb-4">
                    <div className="text-center p-6">
                      <div className="text-4xl mb-2">💬</div>
                      <div className="text-sm text-muted-foreground">
                        微信二维码
                        <br />
                        请联系管理员获取
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-sm">
                    微信扫码添加
                  </Badge>
                </div>

                {/* Alipay QR Code */}
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-primary/20 flex items-center justify-center mb-4">
                    <div className="text-center p-6">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="text-sm text-muted-foreground">
                        支付宝二维码
                        <br />
                        请联系管理员获取
                      </div>
                    </div>
                  </div>
                  <Badge variant="default" className="text-sm">
                    支付宝扫码添加
                  </Badge>
                </div>
              </div>

              <div className="mt-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  添加客服后，发送"开通VIP"即可获取开通方式
                </p>
                <p className="text-xs text-muted-foreground">
                  * 具体价格和套餐请咨询客服
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">更长历史数据</CardTitle>
                <CardDescription>
                  查看 90 天或 180 天的价格历史，更准确地把握价格趋势
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">降价及时提醒</CardTitle>
                <CardDescription>
                  设置目标价格，商品降价时第一时间收到通知，不错过优惠
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">专业分析报告</CardTitle>
                <CardDescription>
                  获取详细的价格分析报告，包括趋势预测和购买建议
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
