// Build/version stamp. NEXT_PUBLIC_GIT_SHA is baked at build time by CI; the
// literal __GIT_SHA__ placeholder marks an un-stamped local/dev build.
export const VERSION = {
  gitSha: process.env.NEXT_PUBLIC_GIT_SHA ?? "__GIT_SHA__",
} as const;

export type Version = typeof VERSION;
