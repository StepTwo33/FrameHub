"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type NavBackProps = {
  href?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
};

const navBackClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground";

export function NavBack({ href, label = "Back", className, onClick }: NavBackProps) {
  const router = useRouter();

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(navBackClassName, className)}>
        <ArrowLeft className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cn(navBackClassName, className)}>
        <ArrowLeft className="h-3.5 w-3.5" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={cn(navBackClassName, className)}>
      <ArrowLeft className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
