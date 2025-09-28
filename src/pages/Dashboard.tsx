import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DashboardStats {
  totalStock: number;
  lowStockItems: number;
  monthSales: number;
  monthPurchases: number;
  payablesDue: number;
  receivablesDue: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_qty: number;
  min_stock: number;
  category: string;
}

const Dashboard = () => {
  const { currentOrgId } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStock: 0,
    lowStockItems: 0,
    monthSales: 0,
    monthPurchases: 0,
    payablesDue: 0,
    receivablesDue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrgId) {
      loadDashboardData();
    }
  }, [currentOrgId]);

  const loadDashboardData = async () => {
    if (!currentOrgId) return;

    try {
      // Get current month dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Total stock quantity
      const { data: stockData } = await supabase
        .from('products')
        .select('stock_qty')
        .eq('org_id', currentOrgId)
        .eq('is_active', true);

      const totalStock = stockData?.reduce((sum, item) => sum + Number(item.stock_qty), 0) || 0;

      // Low stock items
      const { data: lowStock } = await supabase
        .from('products')
        .select('id, name, stock_qty, min_stock, category')
        .eq('org_id', currentOrgId)
        .eq('is_active', true)
        .filter('stock_qty', 'lte', 'min_stock');

      // Month sales
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('org_id', currentOrgId)
        .gte('sale_date', startOfMonth.toISOString().split('T')[0])
        .lte('sale_date', endOfMonth.toISOString().split('T')[0]);

      const monthSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Month purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('total_amount')
        .eq('org_id', currentOrgId)
        .gte('issue_date', startOfMonth.toISOString().split('T')[0])
        .lte('issue_date', endOfMonth.toISOString().split('T')[0]);

      const monthPurchases = purchasesData?.reduce((sum, purchase) => sum + Number(purchase.total_amount), 0) || 0;

      // Payables due next week
      const { data: payablesData } = await supabase
        .from('payables')
        .select('amount')
        .eq('org_id', currentOrgId)
        .eq('status', 'open')
        .lte('due_date', nextWeek.toISOString().split('T')[0]);

      const payablesDue = payablesData?.reduce((sum, payable) => sum + Number(payable.amount), 0) || 0;

      // Receivables due next week
      const { data: receivablesData } = await supabase
        .from('receivables')
        .select('amount')
        .eq('org_id', currentOrgId)
        .eq('status', 'open')
        .lte('due_date', nextWeek.toISOString().split('T')[0]);

      const receivablesDue = receivablesData?.reduce((sum, receivable) => sum + Number(receivable.amount), 0) || 0;

      setStats({
        totalStock,
        lowStockItems: lowStock?.length || 0,
        monthSales,
        monthPurchases,
        payablesDue,
        receivablesDue,
      });

      setLowStockProducts(lowStock || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              unidades em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.monthSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {stats.monthPurchases.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              compras realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar (7 dias)</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {stats.payablesDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              vencendo esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber (7 dias)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats.receivablesDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              vencendo esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>{product.stock_qty}</TableCell>
                    <TableCell>{product.min_stock}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        Estoque Baixo
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;