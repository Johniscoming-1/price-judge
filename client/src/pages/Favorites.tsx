import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: favorites, isLoading } = trpc.favorite.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();
  const removeFavoriteMutation = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      toast.success("已取消收藏");
      utils.favorite.list.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">请先登录</h2>
            <p className="text-muted-foreground mb-6">
              登录后即可查看您收藏的商品
            </p>
            <Button onClick={() => window.location.href = getLoginUrl()}>
              立即登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">我的收藏</h1>
          <p className="text-muted-foreground">
            共 {favorites?.length || 0} 个商品
          </p>
        </div>

        {!favorites || favorites.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">暂无收藏</h2>
              <p className="text-muted-foreground mb-6">
                快去查询商品并添加收藏吧
              </p>
              <Button onClick={() => setLocation("/")}>
                开始查询
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <Card key={fav.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4 mb-4">
                    {fav.product.imageUrl && (
                      <img
                        src={fav.product.imageUrl}
                        alt={fav.product.title}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {fav.product.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {fav.product.platform.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ¥{fav.product.currentPrice}
                    </span>
                    {fav.product.originalPrice && 
                     parseFloat(fav.product.originalPrice) > parseFloat(fav.product.currentPrice) && (
                      <span className="text-sm text-muted-foreground line-through">
                        ¥{fav.product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setLocation(`/product/${fav.product.id}`)}
                    >
                      查看详情
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavoriteMutation.mutate({ productId: fav.product.id })}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Heart className="w-5 h-5 fill-primary text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
