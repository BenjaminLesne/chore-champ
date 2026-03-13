import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function DishwasherEmpty({ size = 48, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="4" width="48" height="56" rx="4" />
      <line x1="8" y1="18" x2="56" y2="18" />
      <line x1="24" y1="11" x2="40" y2="11" strokeWidth={3} />
      <circle cx="48" cy="11" r="2" />
      <circle cx="16" cy="11" r="2" />
      <line x1="14" y1="30" x2="50" y2="30" />
      <line x1="18" y1="30" x2="18" y2="24" />
      <line x1="26" y1="30" x2="26" y2="24" />
      <line x1="34" y1="30" x2="34" y2="24" />
      <line x1="42" y1="30" x2="42" y2="24" />
      <line x1="14" y1="46" x2="50" y2="46" />
      <line x1="18" y1="46" x2="18" y2="40" />
      <line x1="26" y1="46" x2="26" y2="40" />
      <line x1="34" y1="46" x2="34" y2="40" />
      <line x1="42" y1="46" x2="42" y2="40" />
    </svg>
  );
}

export function DishwasherFill({ size = 48, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <rect x="8" y="4" width="48" height="56" rx="4" fill="currentColor" />
      <line
        x1="8"
        y1="18"
        x2="56"
        y2="18"
        stroke="currentColor"
        strokeWidth={2}
      />
      <line
        x1="24"
        y1="11"
        x2="40"
        y2="11"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx="48" cy="11" r="2" fill="#4ade80" />
      <circle cx="16" cy="11" r="2" fill="white" />
      <rect
        x="12"
        y="20"
        width="40"
        height="36"
        rx="2"
        fill="white"
        opacity={0.9}
      />
      <line
        x1="14"
        y1="30"
        x2="50"
        y2="30"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="18"
        y1="30"
        x2="18"
        y2="24"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="26"
        y1="30"
        x2="26"
        y2="24"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="34"
        y1="30"
        x2="34"
        y2="24"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="42"
        y1="30"
        x2="42"
        y2="24"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="14"
        y1="46"
        x2="50"
        y2="46"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="18"
        y1="46"
        x2="18"
        y2="40"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="26"
        y1="46"
        x2="26"
        y2="40"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="34"
        y1="46"
        x2="34"
        y2="40"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1="42"
        y1="46"
        x2="42"
        y2="40"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </svg>
  );
}
