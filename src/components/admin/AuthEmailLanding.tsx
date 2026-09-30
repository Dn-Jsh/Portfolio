"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthEmailLanding() {
  const router = useRouter();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const type = hash.get("type");
    if (type !== "invite" && type !== "recovery") return;

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);

    if (!accessToken || !refreshToken) {
      router.replace("/editportfolio/setup");
      return;
    }

    void (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
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
