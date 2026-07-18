"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";
import { Mail, Loader2, Shield, Send, FlaskConical } from "lucide-react";
import { useConfirmDialog } from "@/components/confirm-dialog-provider";

export default function AdminNewsletterPage() {
  const { confirm } = useConfirmDialog();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState(0);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshCount = useCallback(() => {
    fetch("/api/admin/newsletter")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then((data) => {
        setSubscribers(data.subscribers ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.role === "admin") {
          setAuthorized(true);
          refreshCount();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [refreshCount]);

  const handleSendTest = async () => {
    setError(null);
    setResult(null);
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    if (!testTo.trim()) {
      setError("Enter a test recipient email.");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, testTo: testTo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send test");
        return;
      }
      setResult(`Test sent to ${data.to}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async () => {
    setError(null);
    setResult(null);
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    const ok = await confirm({
      title: `Send newsletter to ${subscribers} subscriber${subscribers === 1 ? "" : "s"}?`,
      description:
        "This emails every opted-in user from news@frame-hub.com. Transactional support mail is not used.",
      confirmLabel: "Send newsletter",
    });
    if (!ok) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }
      setResult(`Sent ${data.sent} of ${data.total}${data.failed ? ` (${data.failed} failed)` : ""}.`);
      setSubject("");
      setBody("");
      refreshCount();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse mx-auto" />
        </div>
      </PageShell>
    );
  }

  if (!authorized) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">Newsletter sends are restricted to admins.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Mail className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Newsletter</h1>
            <p className="text-xs text-muted-foreground">
              Send from news@frame-hub.com · {subscribers} opted-in subscriber
              {subscribers === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card/60 p-4">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 block">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              placeholder="What's new on FrameHub"
              className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5 block">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={20000}
              rows={12}
              placeholder="Write your update in plain text. Blank lines become paragraphs."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-y focus:outline-none focus:border-primary/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{body.length}/20000</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {result && <p className="text-xs text-green-400">{result}</p>}

          <div className="rounded-lg border border-border bg-background/40 p-3 space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase block">
              Send test to one address
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing || sending}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg shrink-0",
                  "bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20",
                  "disabled:opacity-50 transition-colors",
                )}
              >
                {testing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FlaskConical className="h-3.5 w-3.5" />
                )}
                {testing ? "Sending test…" : "Send test"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Uses the subject/body above. Subject is prefixed with [TEST]. Does not email subscribers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || testing || subscribers === 0}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
              "bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25",
              "disabled:opacity-50 transition-colors",
            )}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send newsletter"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
