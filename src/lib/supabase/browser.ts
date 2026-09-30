"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  // Email callbacks are handled by AuthEmailLanding so the code is exchanged
  // once, then removed from the address bar before entering the editor.
  return createBrowserClient(url, anonKey, {
    auth: { detectSessionInUrl: false },
  });
}
