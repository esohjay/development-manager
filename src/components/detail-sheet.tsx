"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

export function DetailSheet({ title, eyebrow, trigger, children }: { title: string; eyebrow?: string; trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);
  const openWithKeyboard = (event: React.KeyboardEvent) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen(true); } };
  return <><div className="sheet-trigger" role="button" tabIndex={0} onClick={() => setOpen(true)} onKeyDown={openWithKeyboard} aria-haspopup="dialog">{trigger}</div>{open && <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}><div className="sheet-handle"/><header className="sheet-head"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div><button type="button" className="btn btn-ghost sheet-close" onClick={() => setOpen(false)} aria-label="Close details"><X size={21}/></button></header><div className="sheet-body">{children}</div></section></div>}</>;
}

export function DetailField({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={wide ? "detail-field wide" : "detail-field"}><span>{label}</span><div>{children || <span className="muted">Not set</span>}</div></div>;
}
