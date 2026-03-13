import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function GarbageEmpty({ size = 48, className, ...props }: IconProps) {
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
      <path d="M12 16h40" />
      <path d="M24 16V12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M16 16l2 38a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2l2-38" />
      <line x1="26" y1="24" x2="26" y2="48" />
      <line x1="32" y1="24" x2="32" y2="48" />
      <line x1="38" y1="24" x2="38" y2="48" />
    </svg>
  );
}

export function GarbageFill({ size = 48, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path
        d="M16 16l2 38a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2l2-38H16z"
        fill="currentColor"
      />
      <rect x="10" y="13" width="44" height="5" rx="1.5" fill="currentColor" />
      <path
        d="M24 13V12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />
      <line
        x1="26"
        y1="24"
        x2="26"
        y2="48"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="32"
        y1="24"
        x2="32"
        y2="48"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="24"
        x2="38"
        y2="48"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}
