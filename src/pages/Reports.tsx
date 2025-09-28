import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface ProductReport {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
  margin: number;
}

interface CustomerReport {
  customer_id: string;
  customer_name: string;
  total_sales: number;
  sales_count: number;
}

const Reports = () => {
  const { currentOrgId } = useAuth();
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [customerReports, setCustomerReports] = useState<CustomerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrgId) {
      loadReports();
    }
  }, [currentOrgId]);

  const loadReports = async () => {
    if (!currentOrgId) return;

    try {
      // Most sold products
      const { data: salesItems, error: salesError } = await supabase
        .from('sale_items')
        .select(`
          qty,
          unit_price,
          total,
          product_id,
          products (
            name,
            cost_price
          ),
          sales!inner (
            org_id
          )
        `)
        .eq('sales.org_id', currentOrgId);

      if (salesError) throw salesError;

      // Group by product
      const productMap = new Map<string, ProductReport>();
      
      salesItems?.forEach((item: any) => {
        const productId = item.product_id;
        const existing = productMap.get(productId);
        
        const revenue = Number(item.total || 0);
        const cost = Number(item.products?.cost_price || 0) * Number(item.qty || 0);
        const margin = revenue - cost;
        
        if (existing) {
          existing.total_qty += Number(item.qty || 0);
          existing.total_revenue += revenue;
          existing.margin += margin;
        } else {
          productMap.set(productId, {
            product_id: productId,
            product_name: item.products?.name || 'Produto não encontrado',
            total_qty: Number(item.qty || 0),
            total_revenue: revenue,
            margin: margin,
          });
        }
      });

      const productReportsArray = Array.from(productMap.values())
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 10);

      // Top customers
      const { data: sales, error: customerError } = await supabase
        .from('sales')
        .select(`
          customer_id,
          total_amount,
          customers (
            name
          )
        `)
        .eq('org_id', currentOrgId);

      if (customerError) throw customerError;

      // Group by customer
      const customerMap = new Map<string, CustomerReport>();
      
      sales?.forEach((sale: any) => {
        const customerId = sale.customer_id;
        const existing = customerMap.get(customerId);
        
        const amount = Number(sale.total_amount || 0);
        
        if (existing) {
          existing.total_sales += amount;
          existing.sales_count += 1;
        } else {
          customerMap.set(customerId, {
            customer_id: customerId,
            customer_name: sale.customers?.name || 'Cliente não encontrado',
            total_sales: amount,
            sales_count: 1,
          });
        }
      });

      const customerReportsArray = Array.from(customerMap.values())
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 10);

      setProductReports(productReportsArray);
      setCustomerReports(customerReportsArray);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar relatórios',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Relatórios</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Qtd. Vendida</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productReports.map((product, index) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{product.product_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.total_qty}</TableCell>
                    <TableCell>
                      R$ {product.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <span className={product.margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {product.margin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {productReports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes Mais Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerReports.map((customer, index) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{customer.customer_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{customer.sales_count}</TableCell>
                    <TableCell>
                      R$ {customer.total_sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      R$ {(customer.total_sales / customer.sales_count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {customerReports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;