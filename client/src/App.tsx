import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Library from "@/pages/library";
import Dashboard from "@/pages/dashboard";
import DictionaryPage from "@/pages/dictionary-page";
import WishlistPage from "@/pages/wishlist-page";
import GoalsPage from "@/pages/goals-page";
import AuthorsPage from "@/pages/authors-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
      </Switch>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <ProtectedRoute path="/" component={Library} />
              <ProtectedRoute path="/wishlist" component={WishlistPage} />
              <ProtectedRoute path="/dashboard" component={Dashboard} />
              <ProtectedRoute path="/dictionary" component={DictionaryPage} />
              <ProtectedRoute path="/goals" component={GoalsPage} />
              <ProtectedRoute path="/authors" component={AuthorsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
