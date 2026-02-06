import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "text-base bg-foreground text-background font-medium",
        destructive:
          "bg-red-950 text-red-100 shadow-xs hover:bg-text-800 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-red-900 border border-red-600",
        outline:
          "border border-neutral-800 bg-transparent shadow-xs hover:bg-neutral-700/50 hover:text-neutral-50",
        secondary: "bg-[#0e140c] text-[#d1cfc0] shadow-xs",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        table: "bg-transparent hover:bg-neutral-700/50",
        dashboard:
          "bg-neutral-900/70 border border-neutral-800 text-neutral-50 hover:bg-neutral-800",
      },
      size: {
        default: "px-6 py-4 rounded-xl",
        md: "h-9 rounded-md gap-1.5 px-3 py-5 has-[>svg]:px-2.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
