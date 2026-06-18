"use client";

import { cn } from "@/lib/utils";
import type { DualFormDef } from "@/lib/dual-form-warframes";

export function DualFormTabs({
  forms,
  activeFormId,
  onChange,
  className,
}: {
  forms: DualFormDef[];
  activeFormId: string;
  onChange: (formId: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-lg border border-border/80 bg-muted/20 p-0.5 gap-0.5", className)}>
      {forms.map((form) => (
        <button
          key={form.id}
          type="button"
          onClick={() => onChange(form.id)}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
            activeFormId === form.id
              ? "bg-background text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40",
          )}
        >
          {form.label}
        </button>
      ))}
    </div>
  );
}
