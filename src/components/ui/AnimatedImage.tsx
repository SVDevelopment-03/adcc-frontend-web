import * as React from "react";
import { cn } from "./utils";

type AnimatedImageZoom = "subtle" | "default" | "strong";

export interface AnimatedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  zoom?: AnimatedImageZoom;
  objectFit?: "cover" | "contain";
  /** Fill parent height (parent needs explicit height) */
  fill?: boolean;
  /** Skip wrapper — parent must have overflow:hidden and adcc-image-group */
  bare?: boolean;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}

export function AnimatedImage({
  zoom = "default",
  objectFit = "cover",
  fill = false,
  bare = false,
  className,
  wrapperClassName,
  wrapperStyle,
  style,
  alt = "",
  ...props
}: AnimatedImageProps) {
  const imgClassName = cn(
    "adcc-image__img",
    objectFit === "contain" && "adcc-image__img--contain",
    fill && "adcc-image__img--fill",
    className,
  );

  if (bare) {
    return <img alt={alt} className={imgClassName} style={style} {...props} />;
  }

  return (
    <div
      className={cn(
        "adcc-image",
        zoom === "subtle" && "adcc-image--subtle",
        zoom === "strong" && "adcc-image--strong",
        fill && "adcc-image--fill",
        wrapperClassName,
      )}
      style={wrapperStyle}
    >
      <img alt={alt} className={imgClassName} style={style} {...props} />
    </div>
  );
}
