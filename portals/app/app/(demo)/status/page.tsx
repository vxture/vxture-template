"use client";

import { useEffect, useState } from "react";

// Three-channel connectivity verification (product_240 section 7). Probes the
// contract-facing endpoints live. Offline (Mock): health is 200, auth/session is
// 200 anonymous, entitlement is 401 without a session - which still demonstrates
// each channel is wired and responding.

interface Probe {
  name: string;
  endpoint: string;
  status: string;
}

const CHANNELS: Omit<Probe, "status">[] = [
  { name: "health", endpoint: "/api/health" },
  { name: "C1 auth (session)", endpoint: "/auth/session" },
  { name: "C2 entitlement", endpoint: "/api/entitlement" },
];

const cell: React.CSSProperties = { border: "1px solid #ccc", padding: "4px 8px", textAlign: "left" };

export default function StatusPage() {
  const [probes, setProbes] = useState<Probe[]>(CHANNELS.map((c) => ({ ...c, status: "..." })));

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CHANNELS.map(async (c) => {
        try {
          const r = await fetch(c.endpoint, { cache: "no-store" });
          return { ...c, status: `HTTP ${r.status}` };
        } catch {
          return { ...c, status: "unreachable" };
        }
      }),
    ).then((res) => {
      if (!cancelled) setProbes(res);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Channel status</h1>
      <p>Live probe of the contract-facing endpoints. C3 (provisioning webhook / usage flush) is inbound/outbound and not probed here.</p>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cell}>channel</th>
            <th style={cell}>endpoint</th>
            <th style={cell}>status</th>
          </tr>
        </thead>
        <tbody>
          {probes.map((p) => (
            <tr key={p.endpoint}>
              <td style={cell}>{p.name}</td>
              <td style={cell}>
                <code>{p.endpoint}</code>
              </td>
              <td style={cell}>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
