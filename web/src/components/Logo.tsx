type Props = {
  className?: string;
};

export default function Logo({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Gym Fonty"
    >
      <defs>
        <linearGradient id="gf-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-brand-500)" />
          <stop offset="100%" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="20" cy="20" r="18" fill="url(#gf-g)" />
        <path
          d="M14 22c2 3 5 5 8 5 5 0 9-4 9-9 0-5-4-9-9-9-4 0-7 2-8 6h6c1-1 2-2 3-2 3 0 5 2 5 5s-2 5-5 5c-1 0-2 0-3-1v-3h-6v3z"
          fill="#fff"
        />
      </g>
      <text
        x="48"
        y="27"
        fontFamily="Inter Variable, system-ui, -apple-system, Segoe UI, Roboto"
        fontWeight="700"
        fontSize="20"
        fill="var(--color-foreground)"
      >
        Gym Fonty
      </text>
    </svg>
  );
}


