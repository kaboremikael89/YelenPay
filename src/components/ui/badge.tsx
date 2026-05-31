import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "gold" | "gray" | "red";

const tones: Record<Tone, string> = {
  green: "bg-[#1e7a46]/10 text-[#1e7a46]",
  gold: "bg-accent/25 text-[#9a5a00]",
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
