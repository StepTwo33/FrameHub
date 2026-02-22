"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { MailCheck, Loader2, RefreshCw } from "lucide-react";

function VerifyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto-focus first input
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Only keep last char
        setCode(newCode);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newCode.every((d) => d !== "")) {
            handleSubmit(newCode.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 0) return;
        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || "";
        }
        setCode(newCode);
        if (pasted.length === 6) {
            handleSubmit(pasted);
        } else {
            inputRefs.current[pasted.length]?.focus();
        }
    };

    const handleSubmit = async (codeStr?: string) => {
        const fullCode = codeStr || code.join("");
        if (fullCode.length !== 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: fullCode }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Verification failed");
                setCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResent(false);
        setError("");

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setResent(true);
                setTimeout(() => setResent(false), 5000);
            }
        } catch {
            setError("Failed to resend code");
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <p className="text-muted-foreground">No email address provided.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-md text-center">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                            <MailCheck className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">Verify your email</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            We sent a 6-digit code to{" "}
                            <span className="text-foreground font-medium">{email}</span>
                        </p>
                    </div>

                    {/* Code Input */}
                    <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-lg font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs mb-4">
                            {error}
                        </div>
                    )}

                    {resent && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-4">
                            A new code has been sent to your email
                        </div>
                    )}

                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || code.some((d) => !d)}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MailCheck className="h-4 w-4" />
                        )}
                        {loading ? "Verifying..." : "Verify email"}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 mx-auto"
                    >
                        {resending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3" />
                        )}
                        {resending ? "Sending..." : "Resend code"}
                    </button>

                    <p className="text-[10px] text-muted-foreground/50 mt-6">
                        Code expires in 10 minutes. Check your inbox and spam folder.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted animate-pulse mx-auto" />
                </div>
            </div>
        }>
            <VerifyForm />
        </Suspense>
    );
}
