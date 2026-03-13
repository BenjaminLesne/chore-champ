import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function WashingMachineEmpty({
  size = 48,
  className,
  ...props
}: IconProps) {
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
      <circle cx="20" cy="11" r="3" />
      <circle cx="32" cy="11" r="3" />
      <circle cx="48" cy="11" r="2" />
      <circle cx="32" cy="40" r="14" />
      <circle cx="32" cy="40" r="8" />
    </svg>
  );
}

export function WashingMachineFill({
  size = 48,
  className,
  ...props
}: IconProps) {
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
      <rect x="8" y="4" width="48" height="14" rx="4" fill="currentColor" />
      <line
        x1="8"
        y1="18"
        x2="56"
        y2="18"
        stroke="currentColor"
        strokeWidth={2}
      />
      <circle cx="20" cy="11" r="3" fill="white" />
      <circle cx="32" cy="11" r="3" fill="white" />
      <circle cx="48" cy="11" r="2" fill="#4ade80" />
      <circle cx="32" cy="40" r="14" fill="white" />
      <circle cx="32" cy="40" r="8" fill="#bfdbfe" />
    </svg>
  );
}
