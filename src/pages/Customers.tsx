import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import NewCustomerForm from "@/components/NewCustomerForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Customer {
  id: string; name: string; document: string | null; email: string | null; phone: string | null; address: string | null;
}

export default function Customers() {
  const { currentOrgId } = useAuth();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { if (currentOrgId) load(); }, [currentOrgId]);

  const load = async () => {
    if (!currentOrgId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from("customers").select("*").eq("org_id", currentOrgId).order("name");
      if (error) throw error;
      setItems(data || []);
    } catch (e:any) {
      toast({ title:"Erro ao carregar clientes", description:e.message, variant:"destructive" });
    } finally { setLoading(false); }
  };

  const filtered = items.filter(c => {
    const t = term.toLowerCase();
    return c.name.toLowerCase().includes(t) || (c.document||"").includes(term) || (c.email||"").toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
            <NewCustomerForm onCreated={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Lista de Clientes</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input className="pl-10" placeholder="Buscar por nome, documento, e-mail..." value={term} onChange={e=>setTerm(e.target.value)} />
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
                    <TableHead>Documento</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Endereço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.document || "-"}</TableCell>
                      <TableCell>{c.email || "-"}</TableCell>
                      <TableCell>{c.phone || "-"}</TableCell>
                      <TableCell>{c.address || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
