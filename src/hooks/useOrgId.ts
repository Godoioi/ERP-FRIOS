import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOrgId() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("default_org")
        .eq("user_id", userId)
        .single();

      if (!error && data?.default_org) setOrgId(data.default_org);
      setLoading(false);
    })();
  }, []);

  return { orgId, loading };
}
