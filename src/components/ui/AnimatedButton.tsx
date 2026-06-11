import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "./utils";

type AnimatedButtonVariant = "green" | "outline";
type AnimatedButtonSize = "sm" | "default" | "lg";

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AnimatedButtonVariant;
  size?: AnimatedButtonSize;
  showArrow?: boolean;
  hoverDark?: boolean;
  squareEnd?: boolean;
  fullWidth?: boolean;
}

const sizeVars: Record<
  AnimatedButtonSize,
  React.CSSProperties & Record<string, string>
> = {
  sm: {
    "--adcc-btn-min-height": "44px",
    "--adcc-btn-padding-x": "22px",
    "--adcc-btn-font-size": "16px",
    "--adcc-btn-arrow-shift": "18px",
    "--adcc-btn-arrow-inset": "16px",
  },
  default: {
    "--adcc-btn-min-height": "49px",
    "--adcc-btn-padding-x": "28px",
    "--adcc-btn-font-size": "18px",
    "--adcc-btn-arrow-shift": "23px",
    "--adcc-btn-arrow-inset": "20px",
  },
  lg: {
    "--adcc-btn-min-height": "53px",
    "--adcc-btn-padding-x": "32px",
    "--adcc-btn-font-size": "18px",
    "--adcc-btn-arrow-shift": "23px",
    "--adcc-btn-arrow-inset": "24px",
  },
};

export function AnimatedButton({
  className,
  style,
  variant = "green",
  size = "default",
  showArrow = true,
  hoverDark = false,
  squareEnd = false,
  fullWidth = false,
  children,
  type = "button",
  ...props
}: any) {
  return (
    <button
      type={type}
      className={cn(
        "adcc-btn",
        variant === "outline" && "adcc-btn--outline",
        size === "sm" && "adcc-btn--sm",
        size === "lg" && "adcc-btn--lg",
        showArrow && "adcc-btn--arrow",
        hoverDark && "adcc-btn--hover-dark",
        squareEnd && "adcc-btn--square-end",
        fullWidth && "adcc-btn--full-width",
        className,
      )}
      style={{ ...sizeVars[size], ...style }}
      {...props}
    >
      <span className="adcc-btn__inner">
        <span className="adcc-btn__label">{children}</span>
      </span>
      {showArrow && (
        <>
          <span className="adcc-btn__arrow adcc-btn__arrow--enter" aria-hidden>
            <ArrowRight size={16} strokeWidth={2} />
          </span>
          <span className="adcc-btn__arrow adcc-btn__arrow--exit" aria-hidden>
            <ArrowRight size={16} strokeWidth={2} />
          </span>
        </>
      )}
    </button>
  );
}
