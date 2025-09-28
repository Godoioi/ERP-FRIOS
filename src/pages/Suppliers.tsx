import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewSupplierForm from "@/components/NewSupplierForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Supplier {
  id: string; name: string; document: string | null; email: string | null; phone: string | null; address: string | null;
}

export default function Suppliers() {
  const { currentOrgId } = useAuth();
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { if (currentOrgId) load(); }, [currentOrgId]);

  const load = async () => {
    if (!currentOrgId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from("suppliers").select("*").eq("org_id", currentOrgId).order("name");
      if (error) throw error;
      setItems(data || []);
    } catch (e:any) {
      toast({ title:"Erro ao carregar fornecedores", description:e.message, variant:"destructive" });
    } finally { setLoading(false); }
  };

  const filtered = items.filter(s => {
    const t = term.toLowerCase();
    return s.name.toLowerCase().includes(t) || (s.document||"").includes(term) || (s.email||"").toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold">Fornecedores</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Fornecedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Novo Fornecedor</DialogTitle></DialogHeader>
            <NewSupplierForm onCreated={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Lista de Fornecedores</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-10" placeholder="Buscar por nome, CNPJ, e-mail..." value={term} onChange={e=>setTerm(e.target.value)} />
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
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.document || "-"}</TableCell>
                      <TableCell>{s.email || "-"}</TableCell>
                      <TableCell>{s.phone || "-"}</TableCell>
                      <TableCell>{s.address || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum fornecedor encontrado</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
