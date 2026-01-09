import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import VipGuide from "./pages/VipGuide";
import { Heart, Home as HomeIcon } from "lucide-react";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";

function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <span className="text-primary">⚖️</span>
            价格审判长
          </button>

          <nav className="hidden md:flex items-center gap-4">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation("/")}
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              首页
            </Button>
            {isAuthenticated && (
              <Button
                variant={location === "/favorites" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLocation("/favorites")}
              >
                <Heart className="w-4 h-4 mr-2" />
                我的收藏
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.name || user?.email || "用户"}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                退出登录
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.location.href = getLoginUrl()}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/vip" component={VipGuide} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
