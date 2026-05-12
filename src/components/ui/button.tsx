import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-[-0.005em] ring-offset-background transition-[background,border,color,box-shadow,transform] duration-150 ease-out active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,hsl(var(--accent))_0%,hsl(var(--accent-hover))_100%)] text-primary-foreground shadow-[0_1px_0_hsl(var(--accent-hover)),0_1px_2px_hsl(var(--foreground)/0.08)] hover:brightness-[1.04] hover:shadow-[0_1px_0_hsl(var(--accent-hover)),0_4px_14px_hsl(var(--accent)/0.30)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.08)] hover:bg-destructive/90",
        outline:
          "border border-border-strong/70 bg-background text-foreground hover:border-accent hover:text-accent hover:bg-accent-light/40",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-surface-2",
        ghost:
          "text-foreground hover:bg-surface-2 hover:text-foreground",
        link: "text-accent underline-offset-[3px] hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 text-sm",
        sm: "h-9 rounded-md px-3.5 text-[13px]",
        lg: "h-12 rounded-lg px-7 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
