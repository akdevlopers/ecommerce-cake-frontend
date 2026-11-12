"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/admin";
import { cn, formatDateTime } from "@/lib/format";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi("/messages")
      .then(setMessages)
      .catch((e) => setError(e.message));
  }, []);

  async function markRead(m) {
    if (m.isRead) return;
    setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, isRead: 1 } : x)));
    adminApi(`/messages/${m.id}`, { method: "PATCH" }).catch(() => {});
  }

  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!messages) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <>
      <AdminPageHeader title="Messages" subtitle={`${messages.length} message(s), ${unread} unread`} />
      {messages.length === 0 ? (
        <div className="card p-10 text-center">No messages from the contact form yet.</div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id}>
              <details
                className={cn("card group p-5", !m.isRead && "border-brand/40")}
                onToggle={(e) => e.currentTarget.open && markRead(m)}
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    {!m.isRead && <span className="h-2 w-2 rounded-full bg-brand" aria-label="Unread" />}
                    <span className="font-medium text-ink">{m.name}</span>
                    <span className="hidden text-sm text-ink-muted sm:inline">
                      — {m.message.slice(0, 70)}
                      {m.message.length > 70 ? "…" : ""}
                    </span>
                  </span>
                  <span className="text-xs text-ink-muted">{formatDateTime(m.createdAt)}</span>
                </summary>
                <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
                  <p className="whitespace-pre-line text-ink">{m.message}</p>
                  <div className="flex flex-wrap gap-4">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 hover:text-brand">
                      <Mail className="h-4 w-4 text-brand" /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-brand">
                        <Phone className="h-4 w-4 text-brand" /> {m.phone}
                      </a>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
