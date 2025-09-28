import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Layout = () => {
  const { user, userProfile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header principal */}
          <header className="h-14 border-b bg-sky-600 text-white flex items-center justify-between px-4 shadow-md">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {/* Logo + Nome empresa */}
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="JBR FRIOS"
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-lg font-bold tracking-wide">
                  JBR FRIOS
                </h1>
              </div>
              {/* Nome do usuário */}
              <div className="ml-4">
                <span className="text-sm">
                  Bem-vindo, {userProfile?.full_name || user.email}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </header>

          {/* Conteúdo principal */}
          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
