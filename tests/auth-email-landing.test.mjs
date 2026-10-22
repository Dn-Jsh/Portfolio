import assert from "node:assert/strict";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import { loadModule } from "./load-typescript.mjs";

async function visitLanding(address, { exchangeError = null, importError = false } = {}) {
  const calls = { imports: 0, cleanUrls: [], codes: [], sessions: [], redirects: [], refreshes: 0 };
  const location = new URL(address);
  const imports = {
    react: { useEffect: (effect) => effect() },
    "next/navigation": {
      useRouter: () => ({
        replace: (path) => calls.redirects.push(path),
        refresh: () => calls.refreshes++,
      }),
    },
  };
  Object.defineProperty(imports, "@/lib/supabase/browser", {
    get() {
      calls.imports++;
      if (importError) throw new Error("Chunk download failed");
      return {
        createBrowserSupabaseClient: () => ({
          auth: {
            exchangeCodeForSession: async (...args) => {
              calls.codes.push(args);
              return { error: exchangeError };
            },
            setSession: async (session) => {
              calls.sessions.push(session);
              return { error: null };
            },
          },
        }),
      };
    },
  });
  const { AuthEmailLanding } = loadModule("../src/components/admin/AuthEmailLanding.tsx", imports, {
    URLSearchParams,
    window: {
      location,
      history: { state: {}, replaceState: (_state, _title, url) => calls.cleanUrls.push(url) },
    },
  });
  assert.equal(AuthEmailLanding(), null);
  await setImmediate();
  return calls;
}

test("ordinary visits never load authentication code or change the URL", async () => {
  const calls = await visitLanding("https://portfolio.test/?ref=profile#projects");
  assert.equal(calls.imports, 0);
  assert.deepEqual(calls.cleanUrls, []);
  assert.deepEqual(calls.redirects, []);
});

test("code callbacks clean sensitive parameters and preserve flow IDs for exchange", async () => {
  const calls = await visitLanding("https://portfolio.test/?ref=profile&code=test-code&sb_flow_id=test-flow#callback");
  assert.equal(calls.imports, 1);
  assert.deepEqual(calls.cleanUrls, ["/?ref=profile"]);
  assert.equal(calls.codes[0][0], "test-code");
  assert.equal(calls.codes[0][1].flowId, "test-flow");
  assert.deepEqual(calls.redirects, ["/editportfolio/setup"]);
  assert.equal(calls.refreshes, 1);
});

for (const type of ["invite", "recovery"]) {
  test(`${type} callbacks establish a session after clearing the fragment`, async () => {
    const calls = await visitLanding(`https://portfolio.test/#type=${type}&access_token=test-access&refresh_token=test-refresh`);
    assert.equal(calls.imports, 1);
    assert.deepEqual(calls.cleanUrls, ["/"]);
    assert.equal(calls.sessions[0].access_token, "test-access");
    assert.equal(calls.sessions[0].refresh_token, "test-refresh");
    assert.deepEqual(calls.redirects, ["/editportfolio/setup"]);
    assert.equal(calls.refreshes, 1);
  });
}

test("invalid callbacks redirect without loading the SDK", async () => {
  for (const suffix of ["?error=access_denied&error_description=expired", "#type=recovery&access_token=incomplete"]) {
    const calls = await visitLanding(`https://portfolio.test/${suffix}`);
    assert.equal(calls.imports, 0);
    assert.deepEqual(calls.cleanUrls, ["/"]);
    assert.deepEqual(calls.redirects, ["/editportfolio/setup"]);
  }
});

test("exchange or deferred import failures still reach the setup page", async () => {
  for (const options of [{ exchangeError: new Error("Expired code") }, { importError: true }]) {
    const calls = await visitLanding("https://portfolio.test/?code=expired", options);
    assert.deepEqual(calls.cleanUrls, ["/"]);
    assert.deepEqual(calls.redirects, ["/editportfolio/setup"]);
    assert.equal(calls.refreshes, 1);
  }
});
