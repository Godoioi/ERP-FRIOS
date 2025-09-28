import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Product = {
  id: string;
  org_id: string;
  name: string;
  category: string | null;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  stock_qty: number;
  barcode: string | null;
  is_active: boolean;
};

export default function EditProductDialog({
  open,
  onOpenChange,
  productId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string | null;
  onSaved?: () => void;
}) {
  const [data, setData] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!open || !productId) return;
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (!error) setData(data as Product);
    })();
  }, [open, productId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    const { id, ...payload } = data;
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    setSaving(false);
    if (error) return alert(`Erro: ${error.message}`);
    onSaved?.();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        {data && (
          <form onSubmit={save} className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <Label>Nome</Label>
              <Input value={data.name} onChange={(e)=>setData({...data, name: e.target.value})} required />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input value={data.category ?? ""} onChange={(e)=>setData({...data, category: e.target.value})}/>
            </div>
            <div>
              <Label>Unidade</Label>
              <Input value={data.unit} onChange={(e)=>setData({...data, unit: e.target.value})}/>
            </div>
            <div>
              <Label>Preço de Custo</Label>
              <Input type="number" step="0.01" value={data.cost_price} onChange={(e)=>setData({...data, cost_price: parseFloat(e.target.value||"0")})}/>
            </div>
            <div>
              <Label>Preço de Venda</Label>
              <Input type="number" step="0.01" value={data.sale_price} onChange={(e)=>setData({...data, sale_price: parseFloat(e.target.value||"0")})}/>
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input type="number" step="0.001" value={data.min_stock} onChange={(e)=>setData({...data, min_stock: parseFloat(e.target.value||"0")})}/>
            </div>
            <div className="md:col-span-2">
              <Label>Código de Barras</Label>
              <Input value={data.barcode ?? ""} onChange={(e)=>setData({...data, barcode: e.target.value})}/>
            </div>
            <div className="md:col-span-2">
              <Label>Status</Label>
              <select
                className="border p-2 rounded w-full"
                value={data.is_active ? "1" : "0"}
                onChange={(e)=>setData({...data, is_active: e.target.value === "1"})}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>
            {/* stock_qty normalmente é controlado por triggers; evite editar manualmente */}
            <div className="md:col-span-6 flex justify-end pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
