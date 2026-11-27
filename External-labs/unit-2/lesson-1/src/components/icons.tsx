import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13.5 2 5 13.5h5.5L9.5 22 19 10h-5.8z" />
  </svg>
);

export const IconAtom = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="2.2" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(120 12 12)" />
  </svg>
);

export const IconRub = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 17.5 9.5 11l4.5 4.5L7.5 22H3z" />
    <path d="M12.5 8.5 15 6a2.5 2.5 0 0 1 3.6 0l1.4 1.4a2.5 2.5 0 0 1 0 3.6l-2.5 2.5" />
    <path d="M4 4.5 5 6M8 3l.6 1.8M14 2.6l-1 1.6" />
  </svg>
);

export const IconMagnet = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3H3v8a9 9 0 0 0 18 0V3h-3v8a6 6 0 0 1-12 0z" />
    <path d="M3 8h3M18 8h3" />
  </svg>
);

export const IconFormula = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20c2.4 0 3-1.6 3.4-4.2L9.6 4.6C10 2.7 10.9 2 12.6 2" />
    <path d="M4.5 9.5h7" />
    <path d="M14 10.5l6 8M20 10.5l-6 8" />
  </svg>
);

export const IconLayers = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.8 2.5 7.4 12 12l9.5-4.6z" />
    <path d="M2.5 12.4 12 17l9.5-4.6" />
    <path d="M2.5 17.2 12 21.8l9.5-4.6" />
  </svg>
);

export const IconFlask = (p: P) => (
  <svg {...base(p)}>
    <path d="M9.5 2.5h5M10.5 2.5v6L4.9 18.2A2.4 2.4 0 0 0 7 21.8h10a2.4 2.4 0 0 0 2.1-3.6L13.5 8.5v-6" />
    <path d="M7.4 15h9.2" />
  </svg>
);

export const IconFactory = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21V9l6 3.6V9l6 3.6V4.5h6V21z" />
    <path d="M7 17h2M13 17h2M18 17h1.5" />
  </svg>
);

export const IconQuiz = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M9.2 8.4a2.8 2.8 0 1 1 3.4 3.4v1.4" />
    <path d="M12.6 16.2h.01" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M8 5.2 19 12 8 18.8z" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <rect x="7" y="5" width="3.6" height="14" rx="1.2" />
    <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" />
  </svg>
);

export const IconReset = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3 3.5V9h5.5" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v11" />
    <path d="M7.5 10 12 14.5 16.5 10" />
    <path d="M4 18.5h16" />
  </svg>
);

export const IconChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const IconSoundOn = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M15.6 9a4.4 4.4 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const IconSoundOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </svg>
);

export const IconTimer = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4.2l2.6 1.8M9.5 2.5h5" />
  </svg>
);

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2.6 4.5 5.4v6c0 4.6 3.1 8.4 7.5 10 4.4-1.6 7.5-5.4 7.5-10v-6z" />
    <path d="M8.8 12.2 11.2 14.6 15.4 10" />
  </svg>
);

export const IconCloudBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 15.5a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.4 1.6A3.6 3.6 0 0 1 17.5 16" />
    <path d="M12.8 12.5 10 17h3l-1.4 4.5 4.4-6h-2.8z" />
  </svg>
);

export const IconBook = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 4.5A2 2 0 0 1 5.5 2.5H19v17H5.5a2 2 0 0 0-2 2z" />
    <path d="M3.5 19.5a2 2 0 0 1 2-2H19" />
  </svg>
);

export const IconSparkle = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
    <path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </svg>
);

export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
  </svg>
);

export const IconLab = (p: P) => (
  <svg {...base(p)}>
    <path d="M8.5 2.5v6.2L4.2 17.4A3 3 0 0 0 6.9 21.8h10.2a3 3 0 0 0 2.7-4.4L15.5 8.7V2.5" />
    <path d="M7.5 2.5h9" />
    <circle cx="10.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="14" cy="18.5" r="1.4" fill="currentColor" />
  </svg>
);