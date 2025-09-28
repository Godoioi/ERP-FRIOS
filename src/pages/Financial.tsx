import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface Payable {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string;
  suppliers?: {
    name: string;
  };
}

interface Receivable {
  id: string;
  amount: number;
  due_date: string;
  status: string;
  received_at: string;
  customers?: {
    name: string;
  };
}

const Financial = () => {
  const { currentOrgId } = useAuth();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrgId) {
      loadFinancialData();
    }
  }, [currentOrgId]);

  const loadFinancialData = async () => {
    if (!currentOrgId) return;

    try {
      // Load payables
      const { data: payablesData, error: payablesError } = await supabase
        .from('payables')
        .select(`
          *,
          suppliers (
            name
          )
        `)
        .eq('org_id', currentOrgId)
        .order('due_date');

      if (payablesError) throw payablesError;

      // Load receivables
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('receivables')
        .select(`
          *,
          customers (
            name
          )
        `)
        .eq('org_id', currentOrgId)
        .order('due_date');

      if (receivablesError) throw receivablesError;

      setPayables(payablesData || []);
      setReceivables(receivablesData || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados financeiros',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (payableId: string) => {
    try {
      const { error } = await supabase
        .from('payables')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', payableId);

      if (error) throw error;

      toast({
        title: 'Conta marcada como paga',
      });
      
      loadFinancialData();
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar como pago',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAsReceived = async (receivableId: string) => {
    try {
      const { error } = await supabase
        .from('receivables')
        .update({ 
          status: 'received',
          received_at: new Date().toISOString()
        })
        .eq('id', receivableId);

      if (error) throw error;

      toast({
        title: 'Conta marcada como recebida',
      });
      
      loadFinancialData();
    } catch (error: any) {
      toast({
        title: 'Erro ao marcar como recebido',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const totalPayablesOpen = payables
    .filter(p => p.status === 'open')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalReceivablesOpen = receivables
    .filter(r => r.status === 'open')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Financeiro</h1>
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
        <h1 className="text-3xl font-bold">Financeiro</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalPayablesOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {payables.filter(p => p.status === 'open').length} contas em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceivablesOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {receivables.filter(r => r.status === 'open').length} contas em aberto
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payables" className="w-full">
        <TabsList>
          <TabsTrigger value="payables">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivables">Contas a Receber</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Contas a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payables.map((payable) => (
                    <TableRow key={payable.id}>
                      <TableCell className="font-medium">
                        {payable.suppliers?.name || 'Fornecedor não encontrado'}
                      </TableCell>
                      <TableCell>
                        R$ {payable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {new Date(payable.due_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payable.status === 'paid' ? 'default' : 'destructive'}>
                          {payable.status === 'paid' ? 'Pago' : 'Em Aberto'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payable.status === 'open' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsPaid(payable.id)}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receivables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Contas a Receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivables.map((receivable) => (
                    <TableRow key={receivable.id}>
                      <TableCell className="font-medium">
                        {receivable.customers?.name || 'Cliente não encontrado'}
                      </TableCell>
                      <TableCell>
                        R$ {receivable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {new Date(receivable.due_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={receivable.status === 'received' ? 'default' : 'secondary'}>
                          {receivable.status === 'received' ? 'Recebido' : 'Em Aberto'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {receivable.status === 'open' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsReceived(receivable.id)}
                          >
                            Marcar como Recebido
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;