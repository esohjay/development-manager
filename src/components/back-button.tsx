"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function BackButton({ fallback, label = "Back" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return <button type="button" className="btn btn-ghost back-button" onClick={() => {
    const referrer = document.referrer;
    if (referrer && new URL(referrer).origin === window.location.origin) router.back();
    else router.push(fallback);
  }}><ArrowLeft size={18}/>{label}</button>;
}

export function ContextBackButton() {
  const pathname = usePathname();
  const goalDetail = /^\/goals\/[^/]+$/.test(pathname);
  const weekDetail = /^\/week\/\d{4}-\d{2}-\d{2}$/.test(pathname);
  if (!goalDetail && !weekDetail) return null;
  return <div className="container context-back"><BackButton fallback={goalDetail ? "/goals" : "/today"} label={goalDetail ? "Back to goals" : "Back"}/></div>;
}
