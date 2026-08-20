"use client";

import { useId } from "react";
import type { JerseyVariant } from "@/lib/types";

interface VariantStyle {
  body: string;
  trim: string;
  /** Secondary stroke drawn behind `trim` for a two-tone edge (City Connect). */
  trimEdge?: string;
  /** Pinstripes only render when this is set — pinstripe variant only. */
  pinstripeColor?: string;
  textFill: string;
  textStroke: string;
}

const VARIANT_STYLES: Record<JerseyVariant, VariantStyle> = {
  navy: {
    body: "#0A1F3D",
    trim: "#FFC52F",
    textFill: "#FFC52F",
    textStroke: "#0A1F3D",
  },
  cityConnect: {
    body: "#5DA9E9",
    trim: "#FFC52F",
    trimEdge: "#FFFFFF",
    textFill: "#FFC52F",
    textStroke: "#0A1F3D",
  },
  gold: {
    body: "#C9A227",
    trim: "#0A1F3D",
    textFill: "#0A1F3D",
    textStroke: "#FFFFFF",
  },
  pinstripe: {
    body: "#FFFFFF",
    trim: "#0A1F3D",
    pinstripeColor: "#0A1F3D",
    textFill: "#0A1F3D",
    textStroke: "#FFC52F",
  },
};

// Garment silhouette: level shoulders with a shallow U notch cut into the
// collar (not a raised bump), boxy set-in sleeves with a flat top edge and a
// short vertical cuff, fairly straight torso sides, and a gently curved hem.
const JERSEY_PATH = `
  M 36 8
  Q 50 16 64 8
  L 88 16
  L 94 32
  L 80 38
  L 76 40
  L 78 86
  Q 65 96 50 96
  Q 35 96 22 86
  L 24 40
  L 20 38
  L 6 32
  L 12 16
  Z
`;

// Nameplate arc: a gentle bow sitting well inside the chest area, clear of
// the collar notch (which bottoms out at y=16) even accounting for ascender
// overshoot above the path.
const ARC_PATH = "M 14 34 Q 50 27 86 34";

const PINSTRIPE_X_POSITIONS = [26, 34, 42, 50, 58, 66, 74];

function lastNameOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1].toUpperCase();
}

// Every name is forced to an exact visual width via textLength — not just
// long ones — so both ends of the roster get a designed margin before the
// torso narrows into the armpit/sleeve seams (roughly x=24 to x=76, 52
// units wide). Short names stay comfortably narrow; long names are capped
// well short of that 52-unit boundary rather than running edge to edge.
function nameMetrics(lastName: string): { fontSize: number; targetWidth: number } {
  const len = lastName.length;
  if (len <= 4) return { fontSize: 16, targetWidth: 34 };
  if (len <= 6) return { fontSize: 14.5, targetWidth: 38 };
  if (len <= 8) return { fontSize: 12.5, targetWidth: 42 };
  return { fontSize: 10.5, targetWidth: 44 };
}

export default function JerseyBack({
  name,
  number,
  variant,
}: {
  name: string;
  number: number | null;
  variant: JerseyVariant;
}) {
  const uid = useId();
  const arcId = `jersey-arc-${uid}`;
  const shadowId = `jersey-shadow-${uid}`;
  const clipId = `jersey-clip-${uid}`;

  const style = VARIANT_STYLES[variant];
  const lastName = lastNameOf(name);
  const { fontSize: nameSize, targetWidth } = nameMetrics(lastName);
  const numberStr = number !== null ? String(number) : "?";
  const numberSize = numberStr.length > 1 ? 32 : 40;

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      role="img"
      aria-label={`${lastName} number ${numberStr}`}
    >
      <defs>
        <path id={arcId} d={ARC_PATH} fill="none" />
        <clipPath id={clipId}>
          <path d={JERSEY_PATH} />
        </clipPath>
        <filter id={shadowId} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* jersey body fill */}
      <path d={JERSEY_PATH} fill={style.body} />

      {/* pinstripes — pinstripe variant only, clipped to the silhouette */}
      {style.pinstripeColor && (
        <g clipPath={`url(#${clipId})`}>
          {PINSTRIPE_X_POSITIONS.map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke={style.pinstripeColor}
              strokeWidth="0.6"
              opacity="0.55"
            />
          ))}
        </g>
      )}

      {/* outline on top of body + pinstripes — a wider edge stroke behind the
          trim color gives City Connect its two-tone gold-on-white edge */}
      {style.trimEdge && (
        <path d={JERSEY_PATH} fill="none" stroke={style.trimEdge} strokeWidth="3.6" strokeLinejoin="round" />
      )}
      <path d={JERSEY_PATH} fill="none" stroke={style.trim} strokeWidth="2.3" strokeLinejoin="round" />

      {/* nameplate — gentle arc inside the chest area, below the collar notch */}
      <text
        fill={style.textFill}
        stroke={style.textStroke}
        strokeWidth="0.7"
        paintOrder="stroke"
        fontFamily="var(--font-scorecard), Impact, sans-serif"
        fontWeight={700}
        fontSize={nameSize}
        letterSpacing="0.5"
        textAnchor="middle"
        dominantBaseline="central"
        textLength={targetWidth}
        lengthAdjust="spacingAndGlyphs"
      >
        <textPath href={`#${arcId}`} startOffset="50%">
          {lastName}
        </textPath>
      </text>

      {/* number — two-tone fill with a thin outline, embroidered-trim style */}
      <text
        x="50"
        y="68"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-scorecard), Impact, sans-serif"
        fontWeight={700}
        fontSize={numberSize}
        fill={style.textFill}
        stroke={style.textStroke}
        strokeWidth="1.4"
        paintOrder="stroke"
        filter={`url(#${shadowId})`}
      >
        {numberStr}
      </text>
    </svg>
  );
}
