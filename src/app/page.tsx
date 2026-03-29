"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { AuthGate } from "@/components/auth/auth-gate";

export default function Home() {
  return <AuthGate />;
}
