import React from "react";
import { cn } from "~/lib/utils";

export const NB_COLORS = {
  cream: "#FFF8E7",
  yellow: "#FFD400",
  pink: "#FF6FA5",
  blue: "#6EC1FF",
  green: "#A3FF66",
  white: "#FFFFFF",
  black: "#111111",
} as const;

export type NBColor = keyof typeof NB_COLORS;

/** Shared border + hard-shadow classes so every bordered surface stays visually consistent. */
export const nbBorder = "border-[3px] border-black";
export const nbBorderThin = "border-2 border-black";
export const nbShadow = "shadow-[5px_5px_0px_0px_#111111]";
export const nbShadowSm = "shadow-[3px_3px_0px_0px_#111111]";
export const nbShadowLg = "shadow-[6px_6px_0px_0px_#111111]";

/** Press-down interaction: shadow shrinks and the element slides into it. Use on anything clickable. */
export const nbPress =
  "transition-all hover:shadow-[2px_2px_0px_0px_#111111] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-[1px_1px_0px_0px_#111111] active:translate-x-[3px] active:translate-y-[3px]";

/** Class string for a bordered form input/select/textarea. */
export const nbInputClass =
  "w-full px-4 py-2.5 rounded-lg border-[3px] border-black bg-white text-black placeholder-black/30 text-sm font-medium focus:outline-none focus:bg-[#FFF8E7] transition-colors";

/** Bold uppercase label to pair with nbInputClass. */
export const nbLabelClass =
  "block text-xs font-extrabold text-black/70 uppercase tracking-wide mb-1.5";

/** Class string for a neobrutal button/CTA — apply to <button>, <Link>, or <a> alike. */
export function nbButtonClass(
  opts: { color?: NBColor; size?: "sm" | "md"; className?: string } = {},
) {
  const { color = "yellow", size = "md", className } = opts;
  return cn(
    "inline-flex items-center justify-center font-extrabold text-black rounded-lg",
    nbBorder,
    nbShadow,
    nbPress,
    "disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" ? "text-sm px-4 py-1.5" : "text-sm px-7 py-3",
    className,
  );
}

type NBButtonProps = React.ComponentProps<"button"> & {
  color?: NBColor;
  size?: "sm" | "md";
};

/** Real <button> element for actions (not navigation) — for links/CTAs use nbButtonClass instead. */
export function NBButton({
  color = "yellow",
  size = "md",
  className,
  style,
  ...props
}: NBButtonProps) {
  return (
    <button
      className={nbButtonClass({ color, size, className })}
      style={{ backgroundColor: NB_COLORS[color], ...style }}
      {...props}
    />
  );
}

type NBCardProps = React.ComponentProps<"div"> & {
  color?: NBColor;
  shadow?: "sm" | "md" | "lg";
  as?: "div" | "li" | "article";
};

/** Bordered, hard-shadowed surface — the base building block for feature blocks, plan cards, list rows, etc. */
export function NBCard({
  color = "white",
  shadow = "md",
  as = "div",
  className,
  style,
  ...props
}: NBCardProps) {
  const shadowClass = shadow === "sm" ? nbShadowSm : shadow === "lg" ? nbShadowLg : nbShadow;
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cn("rounded-lg", nbBorder, shadowClass, className)}
      style={{ backgroundColor: NB_COLORS[color], ...style }}
      {...props}
    />
  );
}

type NBBadgeProps = React.ComponentProps<"span"> & {
  color?: NBColor;
};

/** Small bordered pill — status tags, "Most Popular", plan name chips, etc. */
export function NBBadge({ color = "yellow", className, style, ...props }: NBBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold text-black",
        nbBorderThin,
        className,
      )}
      style={{ backgroundColor: NB_COLORS[color], ...style }}
      {...props}
    />
  );
}
