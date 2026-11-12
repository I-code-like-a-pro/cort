const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const LockIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const KeyIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9" />
    <path d="M16 7l3 3" />
  </svg>
);

export const ChatIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <path d="M4 5h16v11H9l-5 4V5z" />
  </svg>
);

export const BoltIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />
  </svg>
);

export const PulseIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <path d="M3 12h4l3-7 4 14 3-7h4" />
  </svg>
);

export const CodeIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <path d="M8 7l-5 5 5 5" />
    <path d="M16 7l5 5-5 5" />
    <path d="M14 4l-4 16" />
  </svg>
);

export const ShieldCheckIcon = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8" {...base}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const ArrowIcon = () => (
  <svg width="64" height="32" viewBox="0 0 64 32" aria-hidden="true">
    <path d="M0 11h40V2l24 14-24 14v-9H0z" fill="currentColor" />
  </svg>
);
