const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

export const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </svg>
);

export const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2.4" {...base}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);
