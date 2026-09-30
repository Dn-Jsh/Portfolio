"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthEmailLanding() {
  const router = useRouter();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const type = hash.get("type");
    const code = search.get("code");
    const flowId = search.get("sb_flow_id");
    const hasAuthError = search.has("error") || hash.has("error");
    if (!code && type !== "invite" && type !== "recovery" && !hasAuthError) return;

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const cleanUrl = new URL(window.location.href);
    for (const key of ["code", "sb_flow_id", "error", "error_code", "error_description", "sb"]) {
      cleanUrl.searchParams.delete(key);
    }
    cleanUrl.hash = "";
    window.history.replaceState(window.history.state, "", cleanUrl.pathname + cleanUrl.search);

    if (hasAuthError || (!code && (!accessToken || !refreshToken))) {
      router.replace("/editportfolio/setup");
      return;
    }

    void (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error } = code
          ? await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined)
          : await supabase.auth.setSession({ access_token: accessToken!, refresh_token: refreshToken! });
        if (error) throw error;
      } catch {
        // The setup page explains expired or invalid links.
      } finally {
        router.replace("/editportfolio/setup");
        router.refresh();
      }
    })();
  }, [router]);

  return null;
}
