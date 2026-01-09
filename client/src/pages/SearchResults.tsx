import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function SearchResults() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(search);
  const initialKeyword = params.get("q") || "";
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.product.search.useQuery(
    { keyword, page, pageSize: 20 },
    { enabled: !!keyword }
  );

  useEffect(() => {
    const newKeyword = params.get("q") || "";
    if (newKeyword && newKeyword !== keyword) {
      setKeyword(newKeyword);
      setSearchInput(newKeyword);
      setPage(1);
    }
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error("请输入搜索关键字");
      return;
    }
    setLocation(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const handleProductClick = (productUrl: string) => {
    // 直接打开商品链接，或者跳转到解析页面
    window.open(productUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl flex gap-2">
              <Input
                type="text"
                placeholder="搜索商品..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-xl font-semibold mb-2">搜索失败</h2>
              <p className="text-muted-foreground mb-6">{error.message}</p>
              <Button onClick={() => setLocation("/")}>
                返回首页
              </Button>
            </CardContent>
          </Card>
        ) : !data || data.products.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">未找到相关商品</h2>
              <p className="text-muted-foreground mb-6">
                试试搜索其他关键词，或粘贴商品链接直接查询
              </p>
              <Button onClick={() => setLocation("/")}>
                返回首页
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                搜索结果：{keyword}
              </h1>
              <p className="text-muted-foreground">
                找到 {data.total} 个相关商品
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.products.map((product, index) => (
                <Card
                  key={`${product.platform}-${product.productId}-${index}`}
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleProductClick(product.productUrl)}
                >
                  <CardContent className="pt-6">
                    {product.imageUrl && (
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          ¥{product.currentPrice}
                        </div>
                        {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.currentPrice) && (
                          <div className="text-sm text-muted-foreground line-through">
                            ¥{product.originalPrice}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {product.platform.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {product.shop && (
                      <div className="text-xs text-muted-foreground">
                        {product.shop}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.total > data.pageSize && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  上一页
                </Button>
                <div className="flex items-center px-4">
                  第 {page} 页 / 共 {Math.ceil(data.total / data.pageSize)} 页
                </div>
                <Button
                  variant="outline"
                  disabled={!data.hasMore}
                  onClick={() => setPage(p => p + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
