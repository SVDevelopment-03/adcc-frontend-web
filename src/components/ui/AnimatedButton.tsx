import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "./utils";

type AnimatedButtonVariant = "green" | "outline";
type AnimatedButtonSize = "sm" | "default" | "lg";

export interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
            <svg
              width="22"
              height="21"
              viewBox="0 0 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="adcc-btn__arrow adcc-btn__arrow--exit" aria-hidden>
            <svg
              width="22"
              height="21"
              viewBox="0 0 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </>
      )}
    </button>
  );
}
