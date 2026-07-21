import { test } from "node:test";
import assert from "node:assert/strict";
import { buildHealthIdentity } from "@product-code/shared/health";

// 025 section 3 + 6: the liveness identity block must be complete AND honest.
// Un-injected build env falls back to dev/unknown - it must NEVER fabricate a
// version (no "1.0.0", gitSha "dev", or stage "local").

const PROV_KEYS = ["APP_VERSION", "GIT_SHA", "DEPLOY_STAGE", "BUILD_TIME"] as const;

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const saved: Record<string, string | undefined> = {};
  for (const k of PROV_KEYS) saved[k] = process.env[k];
  for (const k of PROV_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const k of PROV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

test("identity block carries the full 025 field set", () => {
  const h = buildHealthIdentity({ service: "svc", product: "prod", now: "T" });
  assert.equal(h.status, "ok");
  assert.equal(h.service, "svc");
  assert.equal(h.product, "prod");
  assert.equal(h.time, "T");
  const rec = h as unknown as Record<string, unknown>;
  for (const k of ["version", "gitSha", "stage", "buildTime"]) {
    assert.equal(typeof rec[k], "string", `${k} must be a string`);
  }
});

test("honest fallbacks when build env is absent - no fabrication", () => {
  withEnv({}, () => {
    const h = buildHealthIdentity({ now: "T" });
    assert.equal(h.version, "dev");
    assert.equal(h.gitSha, "unknown");
    assert.equal(h.stage, "dev");
    assert.equal(h.buildTime, "unknown");
    // the three classic fabricated values must never appear
    assert.notEqual(h.version, "1.0.0");
    assert.notEqual(h.gitSha, "dev");
    assert.notEqual(h.stage, "local");
  });
});

test("reads the build-injected provenance verbatim", () => {
  withEnv(
    { APP_VERSION: "v9.9.9", GIT_SHA: "abcd1234", DEPLOY_STAGE: "production", BUILD_TIME: "2026-01-01T00:00:00Z" },
    () => {
      const h = buildHealthIdentity({ now: "T" });
      assert.equal(h.version, "v9.9.9");
      assert.equal(h.gitSha, "abcd1234"); // bare, no "sha-" prefix
      assert.equal(h.stage, "production");
      assert.equal(h.buildTime, "2026-01-01T00:00:00Z");
    },
  );
});
