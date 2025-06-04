// components/ui/typography.tsx
import * as React from "react"
import { cn } from "@/lib/utils" // Your utility for cn

export function TypographyH1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)} {...props} />
}
// ... Add H2, H3, H4, P, Small, Muted, etc. from Shadcn docs
// For this example, we mainly used H1, P, and Small (which you can just use <p className="text-sm"> for)
export function TypographyP({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props} />
}
export function TypographySmall({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
    return <small className={cn("text-sm font-medium leading-none", className)} {...props} />;
}