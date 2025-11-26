import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border-2 border-surface-variant bg-surface px-4 py-3 text-base font-medium text-on-surface ring-offset-background transition-all duration-200 placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-primary/50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
