import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/hooks/useOrgId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  onCreated?: () => void; // opcional: recarrega a lista sem dar F5
};

export default function NewProductForm({ onCreated }: Props) {
  const { orgId, loading } = useOrgId();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("kg");
  const [cost, setCost] = useState<string>("0");
  const [price, setPrice] = useState<string>("0");
  const [minStock, setMinStock] = useState<string>("0");

  if (loading) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return alert("Seu usuário não está vinculado a uma organização (default_org).");

    const costNum = parseFloat(cost || "0");
    const priceNum = parseFloat(price || "0");
    const minStockNum = parseFloat(minStock || "0");

    const { error } = await supabase.from("products").insert({
      org_id: orgId,
      name,
      category,
      unit,
      cost_price: isNaN(costNum) ? 0 : costNum,
      sale_price: isNaN(priceNum) ? 0 : priceNum,
      min_stock: isNaN(minStockNum) ? 0 : minStockNum,
      stock_qty: 0,
      is_active: true,
    });

    if (error) return alert(`Erro ao criar produto: ${error.message}`);

    // limpa e avisa
    setName(""); setCategory(""); setUnit("kg"); setCost("0"); setPrice("0"); setMinStock("0");
    onCreated?.();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6">
      <div className="md:col-span-2">
        <Label>Nome</Label>
        <Input value={name} onChange={e=>setName(e.target.value)} required placeholder="Mussarela peça 3kg" />
      </div>

      <div>
        <Label>Categoria</Label>
        <Input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Queijo / Frios" />
      </div>

      <div>
        <Label>Unidade</Label>
        <Input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="kg / un / cx" />
      </div>

      <div>
        <Label>Preço de Custo</Label>
        <Input type="number" step="0.01" value={cost} onChange={e=>setCost(e.target.value)} />
      </div>

      <div>
        <Label>Preço de Venda</Label>
        <Input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} />
      </div>

      <div>
        <Label>Estoque Mínimo</Label>
        <Input type="number" step="0.001" value={minStock} onChange={e=>setMinStock(e.target.value)} />
      </div>

      <div className="md:col-span-6 flex justify-end pt-2">
        <Button type="submit">Salvar Produto</Button>
      </div>
    </form>
  );
}
