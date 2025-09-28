import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/hooks/useOrgId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProductOpt = { id: string; name: string; cost_price?: number | null };
type SupplierOpt = { id: string; name: string };

export default function NewPurchaseForm({ onCreated }: { onCreated?: () => void }) {
  const { orgId, loading } = useOrgId();
  const [suppliers, setSuppliers] = useState<SupplierOpt[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("0");

  useEffect(() => {
    (async () => {
      if (!orgId) return;
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("suppliers").select("id,name").eq("org_id", orgId).order("name"),
        supabase.from("products").select("id,name,cost_price").eq("org_id", orgId).order("name"),
      ]);
      setSuppliers(s || []);
      setProducts(p || []);
    })();
  }, [orgId]);

  useEffect(() => {
    if (!productId) return;
    const prod = products.find((x) => x.id === productId);
    if (prod && prod.cost_price != null) setUnitPrice(String(prod.cost_price));
  }, [productId, products]);

  if (loading) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return alert("Sem organização.");
    if (!supplierId || !productId) return alert("Selecione fornecedor e produto.");

    const qtyNum = parseFloat(qty || "0");
    const priceNum = parseFloat(unitPrice || "0");
    const total = (isNaN(qtyNum) ? 0 : qtyNum) * (isNaN(priceNum) ? 0 : priceNum);

    // 1) compra
    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert({ org_id: orgId, supplier_id: supplierId, total_amount: total, notes: "Compra rápida" })
      .select("id")
      .single();
    if (error) return alert(`Erro ao criar compra: ${error.message}`);

    // 2) item
    const { error: e2 } = await supabase
      .from("purchase_items")
      .insert({ purchase_id: purchase.id, product_id: productId, qty: qtyNum, unit_price: priceNum });
    if (e2) return alert(`Erro item: ${e2.message}`);

    // 3) a pagar (sem description)
    const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error: e3 } = await supabase.from("payables").insert({
      org_id: orgId,
      supplier_id: supplierId,
      purchase_id: purchase.id,
      amount: total,
      due_date: due,
      status: "open",
    });
    if (e3) return alert(`Compra criada, mas falhou criar a pagar: ${e3.message}`);

    onCreated?.();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-6">
      <div className="md:col-span-2">
        <Label>Fornecedor</Label>
        <select className="border p-2 rounded w-full" value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} required>
          <option value="">Selecione…</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="md:col-span-2">
        <Label>Produto</Label>
        <select className="border p-2 rounded w-full" value={productId} onChange={(e)=>setProductId(e.target.value)} required>
          <option value="">Selecione…</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <Label>Quantidade</Label>
        <Input type="number" step="0.001" value={qty} onChange={e=>setQty(e.target.value)} />
      </div>

      <div>
        <Label>Preço unit.</Label>
        <Input type="number" step="0.01" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} />
      </div>

      <div className="md:col-span-6 flex justify-end pt-2">
        <Button type="submit">Salvar Compra</Button>
      </div>
    </form>
  );
}
