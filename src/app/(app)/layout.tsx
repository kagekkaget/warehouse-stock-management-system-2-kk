export const runtime = "nodejs";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/auth";
import { TrakteerWidget } from "@/components/trakteer-widget";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <>
      <AppShell user={user}>{children}</AppShell>
      <TrakteerWidget />
    </>
  );
}
