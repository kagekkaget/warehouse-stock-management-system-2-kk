import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base(props: P) {
  const { size = 18, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export const IconDashboard = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7.5" height="9" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
    <rect x="13.5" y="12" width="7.5" height="9" rx="1.5" />
    <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 8.2 12 3 3 8.2v7.6L12 21l9-5.2V8.2Z" />
    <path d="M3.3 8.3 12 13.3l8.7-5" />
    <path d="M12 13.3V21" />
  </svg>
);

export const IconCart = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 3h2.5l2.1 11.2a1.6 1.6 0 0 0 1.6 1.3h7.7a1.6 1.6 0 0 0 1.6-1.2L20 8H6.2" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15.5 5.4a3.2 3.2 0 1 1 .4 6.3" />
    <path d="M17.5 15.3c1.9.6 2.9 2.2 3.3 4.7" />
  </svg>
);

export const IconReport = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M14.5 3v4.5H19" />
    <path d="M9 13v5M12.5 11v7M16 15v3" />
  </svg>
);

export const IconUserCog = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10" cy="8" r="3.2" />
    <path d="M4 20c.6-3.2 2.9-5 6-5 1 0 2 .2 2.8.6" />
    <circle cx="17.5" cy="17.5" r="2.6" />
    <path d="M17.5 13.5v1.4M17.5 20.1v1.4M21 15.5l-1.2.7M15.2 18.8 14 19.5M21 19.5l-1.2-.7M15.2 16.2 14 15.5" />
  </svg>
);

export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h-7v16h7" />
    <path d="M10 12h11M18 8.5 21.5 12 18 15.5" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconPencil = (p: P) => (
  <svg {...base(p)}>
    <path d="m14.5 5.5 4 4L8 20l-4.7.7L4 16 14.5 5.5Z" />
    <path d="m12.5 7.5 4 4" />
  </svg>
);

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9.5 7V4.5h5V7" />
    <path d="M6.5 7l1 13h9l1-13" />
    <path d="M10 11v5M14 11v5" />
  </svg>
);

export const IconAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 22 20H2L12 3.5Z" />
    <path d="M12 10v4.5M12 17.4v.1" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4-4" />
  </svg>
);

export const IconDownload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v10.5M7.5 11 12 15.5 16.5 11" />
    <path d="M4.5 16.5V20h15v-3.5" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6.5h16M4 12h16M4 17.5h16" />
  </svg>
);

export const IconWifi = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 9.5C8 4.5 16 4.5 21.5 9.5" />
    <path d="M5.5 13c4-3.5 9-3.5 13 0" />
    <path d="M8.5 16.2c2-1.8 5-1.8 7 0" />
    <path d="M12 19.5v.01" />
  </svg>
);

export const IconWifiOff = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 3 18 18" />
    <path d="M2.5 9.5a14 14 0 0 1 5-3M12.5 5.1c3.3.2 6.4 1.6 9 4.4" />
    <path d="M5.5 13a10 10 0 0 1 3-1.9M13.8 11.3c1.6.4 3.2 1.1 4.7 2.4" />
    <path d="M8.5 16.2a5.6 5.6 0 0 1 5.4-.9" />
    <path d="M12 19.5v.01" />
  </svg>
);

export const IconArrowDown = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
);

export const IconArrowUp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20V4M6 10l6-6 6 6" />
  </svg>
);

export const IconLeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20c0-9 4-15 16-16-.5 12-6 16-13 14" />
    <path d="M4 20c3-5 7-9 12-11" />
  </svg>
);

export const IconMoney = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6.5 9.5v.01M17.5 14.5v.01" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5V19a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

export const IconChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </svg>
);

export const IconBrand = (p: P) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M3.5 8 12 3l8.5 5v9L12 21l-8.5-4V8Z" />
    <path d="M3.7 8.2 12 13l8.3-4.8" />
    <path d="M12 13v8" />
    <path d="M8 5.4l8.4 4.9" />
  </svg>
);

export const IconCoffee = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <path d="M6 1v3M10 1v3M14 1v3" />
  </svg>
);

export const IconCode = (p: P) => (
  <svg {...base(p)}>
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </svg>
);

export const IconExternalLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
  </svg>
);
