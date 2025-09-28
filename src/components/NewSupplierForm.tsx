import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/hooks/useOrgId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function NewSupplierForm({ onCreated }: { onCreated?: () => void }) {
  const { orgId, loading } = useOrgId();
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  if (loading) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return alert("Seu usuário não está vinculado a uma organização.");
    const { error } = await supabase.from("suppliers").insert({
      org_id: orgId, name, document, email, phone, address,
    });
    if (error) return alert(`Erro: ${error.message}`);
    setName(""); setDocument(""); setEmail(""); setPhone(""); setAddress("");
    onCreated?.();
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
      <div className="md:col-span-2">
        <Label>Nome</Label>
        <Input value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <Label>CNPJ</Label>
        <Input value={document} onChange={e=>setDocument(e.target.value)} />
      </div>
      <div>
        <Label>E-mail</Label>
        <Input value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <Label>Telefone</Label>
        <Input value={phone} onChange={e=>setPhone(e.target.value)} />
      </div>
      <div className="md:col-span-3">
        <Label>Endereço</Label>
        <Input value={address} onChange={e=>setAddress(e.target.value)} />
      </div>
      <div className="md:col-span-5 flex justify-end pt-2">
        <Button type="submit">Salvar Fornecedor</Button>
      </div>
    </form>
  );
}
