import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewPurchaseForm from "@/components/NewPurchaseForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Purchase { id: string; supplier_id: string; total_amount: number; created_at: string; }
interface Supplier { id: string; name: string; }

export default function Purchases() {
  const { currentOrgId } = useAuth();
  const [items, setItems] = useState<(Purchase & { supplier_name?: string })[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { if (currentOrgId) load(); }, [currentOrgId]);

  const load = async () => {
    if (!currentOrgId) return;
    try {
      setLoading(true);
      const [{ data: p, error: e1 }, { data: s, error: e2 }] = await Promise.all([
        supabase.from("purchases").select("*").eq("org_id", currentOrgId).order("created_at", { ascending:false }),
        supabase.from("suppliers").select("id,name").eq("org_id", currentOrgId)
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      setSuppliers(s || []);
      const mapName = new Map((s||[]).map(x => [x.id, x.name]));
      setItems((p||[]).map(x => ({ ...x, supplier_name: mapName.get(x.supplier_id) })));
    } catch (e:any) {
      toast({ title:"Erro ao carregar compras", description:e.message, variant:"destructive" });
    } finally { setLoading(false); }
  };

  const filtered = items.filter(i =>
    (i.supplier_name||"").toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold">Compras</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Compra</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Nova Compra</DialogTitle></DialogHeader>
            <NewPurchaseForm onCreated={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Lista de Compras</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-10" placeholder="Buscar por fornecedor..." value={term} onChange={e=>setTerm(e.target.value)} />
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
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{new Date(p.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{p.supplier_name || "-"}</TableCell>
                      <TableCell>R$ {p.total_amount?.toLocaleString("pt-BR", { minimumFractionDigits:2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhuma compra encontrada</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
