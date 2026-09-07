"use client"
/* eslint-disable sarj/no-raw-color, sarj/use-ui-primitives, sarj/no-arbitrary-scale --
   A skeuomorphic specimen, deliberately outside the token system: the whole
   subject is a literal metal gradient, a letterpress text-shadow and a hairline
   bevel, none of which any brand token describes or should. It is not a Sarj
   component and nothing imports it. Kept as a reference for the technique;
   delete the file rather than trying to bring it onto the scale. */
/**
 * Glossy silver pill button with a vertical white-to-gray gradient stroke and embossed letterpress text, in slim steel and chunky pearl variants.
 */
import React from "react"
import { cn } from "@/lib/utils"

export type SilverVariant = "steel" | "pearl"

interface SilverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SilverVariant
}

const variantStyles: Record<
  SilverVariant,
  {
    body: string
    border: string
    borderWidth: string
    radius: string
    padding: string
    fontSize: string
    textColor: string
    textShadow: string
    shadow: string
  }
> = {
  steel: {
    body: "linear-gradient(180deg, #ededed 0%, #9e9e9e 100%)",
    border: "linear-gradient(180deg, #ffffff 0%, #7a7a7a 51%, #7bae9e 100%)",
    borderWidth: "1.5px",
    radius: "47px",
    padding: "10px 47px",
    fontSize: "16px",
    textColor: "rgba(0,0,0,0.08)",
    textShadow: "0px 1px 0px rgba(255,255,255,0.25)",
    shadow: "0 1px 2px rgba(0,0,0,0.18), 0 4px 10px -3px rgba(0,0,0,0.14)",
  },
  pearl: {
    body: "linear-gradient(180deg, #bebdbd 0%, #ffffff 100%)",
    border: "linear-gradient(180deg, #ffffff 0%, #dedede 50%, #bdbdbd 100%)",
    borderWidth: "5px",
    radius: "75px",
    padding: "10px 41px",
    fontSize: "14px",
    textColor: "rgba(0,0,0,0.1)",
    textShadow: "0px 1px 0px rgba(255,255,255,0.19)",
    shadow: "0 1px 3px rgba(0,0,0,0.16), 0 6px 14px -4px rgba(0,0,0,0.16)",
  },
}

const SilverButton = React.forwardRef<HTMLButtonElement, SilverButtonProps>(
  ({ className, children, variant = "steel", style, ...props }, ref) => {
    const v = variantStyles[variant]
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap font-medium leading-[23px] outline-none transition-transform duration-150 active:scale-[0.98] motion-reduce:transition-none",
          className,
        )}
        style={{
          fontFamily:
            '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
          padding: v.padding,
          borderRadius: v.radius,
          border: `${v.borderWidth} solid transparent`,
          fontSize: v.fontSize,
          color: v.textColor,
          textShadow: v.textShadow,
          background: `${v.body} padding-box, ${v.border} border-box`,
          boxShadow: v.shadow,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  },
)

SilverButton.displayName = "SilverButton"

export default SilverButton
