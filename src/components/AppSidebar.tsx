import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  FileText,
  Home
} from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Produtos', url: '/products', icon: Package },
  { title: 'Clientes', url: '/customers', icon: Users },
  { title: 'Fornecedores', url: '/suppliers', icon: Truck },
  { title: 'Compras', url: '/purchases', icon: ShoppingCart },
  { title: 'Vendas', url: '/sales', icon: ShoppingBag },
  { title: 'Financeiro', url: '/financial', icon: CreditCard },
  { title: 'Relatórios', url: '/reports', icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path) ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50';

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'}>
      <SidebarContent>
        <div className="p-4">
          <h1 className={`font-bold text-lg text-sidebar-primary ${collapsed ? 'hidden' : 'block'}`}>
            ERP Frios
          </h1>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block'}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}