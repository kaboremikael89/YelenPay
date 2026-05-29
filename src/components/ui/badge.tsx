import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "gold" | "gray" | "red";

const tones: Record<Tone, string> = {
  green: "bg-primary/10 text-primary",
  gold: "bg-accent/20 text-[#8a6d00]",
  gray: "bg-black/5 text-muted",
  red: "bg-danger/10 text-danger",
};

export function Badge({
  className,
  tone = "gray",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
