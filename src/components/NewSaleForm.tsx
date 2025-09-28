import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/hooks/useOrgId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ProductOpt = { id: string; name: string; sale_price?: number | null };
type CustomerOpt = { id: string; name: string };

export default function NewSaleForm({ onCreated }: { onCreated?: () => void }) {
  const { orgId, loading } = useOrgId();
  const [customers, setCustomers] = useState<CustomerOpt[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState<string>("1");
  const [unitPrice, setUnitPrice] = useState<string>("0");
  const [discount, setDiscount] = useState<string>("0");

  useEffect(() => {
    (async () => {
      if (!orgId) return;
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from("customers").select("id,name").eq("org_id", orgId).order("name"),
        supabase.from("products").select("id,name,sale_price").eq("org_id", orgId).order("name"),
      ]);
      setCustomers(c || []);
      setProducts(p || []);
    })();
  }, [orgId]);

  useEffect(() => {
    if (!productId) return;
    const prod = products.find((x) => x.id === productId);
    if (prod && prod.sale_price != null) setUnitPrice(String(prod.sale_price));
  }, [productId, products]);

  if (loading) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return alert("Sem organização.");
    if (!customerId || !productId) return alert("Selecione cliente e produto.");

    const qtyNum = parseFloat(qty || "0");
    const priceNum = parseFloat(unitPrice || "0");
    const discNum = parseFloat(discount || "0");
    const total =
      (isNaN(qtyNum) ? 0 : qtyNum) * (isNaN(priceNum) ? 0 : priceNum) - (isNaN(discNum) ? 0 : discNum);

    // 1) venda
    const { data: sale, error } = await supabase
      .from("sales")
      .insert({ org_id: orgId, customer_id: customerId, total_amount: total, discount: discNum })
      .select("id")
      .single();
    if (error) return alert(`Erro ao criar venda: ${error.message}`);

    // 2) item
    const { error: e2 } = await supabase
      .from("sale_items")
      .insert({ sale_id: sale.id, product_id: productId, qty: qtyNum, unit_price: priceNum });
    if (e2) return alert(`Erro item: ${e2.message}`);

    // 3) a receber (sem description)
    const due = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const { error: e3 } = await supabase.from("receivables").insert({
      org_id: orgId,
      customer_id: customerId,
      sale_id: sale.id,
      amount: total,
      due_date: due,
      status: "open",
    });
    if (e3) return alert(`Venda criada, mas falhou criar a receber: ${e3.message}`);

    onCreated?.();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-7">
      <div className="md:col-span-2">
        <Label>Cliente</Label>
        <select className="border p-2 rounded w-full" value={customerId} onChange={(e)=>setCustomerId(e.target.value)} required>
          <option value="">Selecione…</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
        <Input type="number" step="0.001" value={qty} onChange={(e)=>setQty(e.target.value)} />
      </div>

      <div>
        <Label>Preço unit.</Label>
        <Input type="number" step="0.01" value={unitPrice} onChange={(e)=>setUnitPrice(e.target.value)} />
      </div>

      <div>
        <Label>Desconto</Label>
        <Input type="number" step="0.01" value={discount} onChange={(e)=>setDiscount(e.target.value)} />
      </div>

      <div className="md:col-span-7 flex justify-end pt-2">
        <Button type="submit">Salvar Venda</Button>
      </div>
    </form>
  );
}
