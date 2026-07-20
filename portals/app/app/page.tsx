import { BRAND } from "@product-code/shared/brand";
import { VERSION } from "@product-code/shared/version";

// Skeleton landing. The domain UI (the app route group) and the contract-facing
// auth/entitlement gates arrive in later batches; this shell only proves the app
// builds and serves.
export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>{BRAND.displayName}</h1>
      <p>Vxture product template shell. Build {VERSION.gitSha}.</p>
    </main>
  );
}
