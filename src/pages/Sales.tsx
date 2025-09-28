import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewSaleForm from "@/components/NewSaleForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Sale { id: string; customer_id: string; total_amount: number; created_at: string; }
interface Customer { id: string; name: string; }

export default function Sales() {
  const { currentOrgId } = useAuth();
  const [items, setItems] = useState<(Sale & { customer_name?: string })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { if (currentOrgId) load(); }, [currentOrgId]);

  const load = async () => {
    if (!currentOrgId) return;
    try {
      setLoading(true);
      const [{ data: s, error: e1 }, { data: c, error: e2 }] = await Promise.all([
        supabase.from("sales").select("*").eq("org_id", currentOrgId).order("created_at", { ascending:false }),
        supabase.from("customers").select("id,name").eq("org_id", currentOrgId)
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setCustomers(c || []);
      const mapName = new Map((c||[]).map(x => [x.id, x.name]));
      setItems((s||[]).map(x => ({ ...x, customer_name: mapName.get(x.customer_id) })));
    } catch (e:any) {
      toast({ title:"Erro ao carregar vendas", description:e.message, variant:"destructive" });
    } finally { setLoading(false); }
  };

  const filtered = items.filter(i =>
    (i.customer_name||"").toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Venda</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Nova Venda</DialogTitle></DialogHeader>
            <NewSaleForm onCreated={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Lista de Vendas</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-10" placeholder="Buscar por cliente..." value={term} onChange={e=>setTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{s.customer_name || "-"}</TableCell>
                      <TableCell>R$ {s.total_amount?.toLocaleString("pt-BR", { minimumFractionDigits:2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhuma venda encontrada</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
