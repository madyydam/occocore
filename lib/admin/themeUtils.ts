export interface BrandThemePalette {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActive: string;
  sidebarActiveBorder: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
}

// Convert hex to rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getThemeFromColor(hexColor: string): BrandThemePalette {
  const hex = hexColor.trim() || "#1D4ED8";
  const { r, g, b } = hexToRgb(hex);

  // Check if it's primarily a red hue (e.g. #DC2626, #EF4444, #B91C1C, etc.)
  const isRed = (r > 160 && g < 100 && b < 100) || hex.toLowerCase().includes("dc2626") || hex.toLowerCase().includes("ef4444") || hex.toLowerCase().includes("b91c1c");
  const isEmerald = (g > 120 && r < 100) || hex.toLowerCase().includes("059669") || hex.toLowerCase().includes("10b981") || hex.toLowerCase().includes("091d17");
  const isViolet = (b > 150 && r > 100 && g < 100) || hex.toLowerCase().includes("7c3aed") || hex.toLowerCase().includes("8b5cf6");
  const isAmber = (r > 180 && g > 100 && b < 80) || hex.toLowerCase().includes("d97706") || hex.toLowerCase().includes("f59e0b");

  if (isRed) {
    return {
      primary: hex,
      primaryHover: "#B91C1C",
      primaryLight: "#FEE2E2",
      primaryText: "#991B1B",
      sidebarBg: "#170709", // Deep Crimson Dark
      sidebarBorder: "#341014",
      sidebarActive: "rgba(220, 38, 38, 0.28)",
      sidebarActiveBorder: "rgba(239, 68, 68, 0.55)",
      badgeBg: "#FEE2E2",
      badgeText: "#991B1B",
      glow: "rgba(220, 38, 38, 0.35)",
    };
  }

  if (isEmerald) {
    return {
      primary: hex,
      primaryHover: "#047857",
      primaryLight: "#D1FAE5",
      primaryText: "#065F46",
      sidebarBg: "#091D17", // Deep Forest Dark
      sidebarBorder: "#12362C",
      sidebarActive: "#164338",
      sidebarActiveBorder: "#23584B",
      badgeBg: "#DCFCE7",
      badgeText: "#15803D",
      glow: "rgba(16, 185, 129, 0.35)",
    };
  }

  if (isViolet) {
    return {
      primary: hex,
      primaryHover: "#6D28D9",
      primaryLight: "#EDE9FE",
      primaryText: "#5B21B6",
      sidebarBg: "#120921", // Deep Violet Dark
      sidebarBorder: "#2B164C",
      sidebarActive: "rgba(124, 58, 237, 0.28)",
      sidebarActiveBorder: "rgba(139, 92, 246, 0.55)",
      badgeBg: "#EDE9FE",
      badgeText: "#6D28D9",
      glow: "rgba(124, 58, 237, 0.35)",
    };
  }

  if (isAmber) {
    return {
      primary: hex,
      primaryHover: "#B45309",
      primaryLight: "#FEF3C7",
      primaryText: "#92400E",
      sidebarBg: "#1C1106", // Deep Amber Dark
      sidebarBorder: "#3C240E",
      sidebarActive: "rgba(217, 119, 6, 0.28)",
      sidebarActiveBorder: "rgba(245, 158, 11, 0.55)",
      badgeBg: "#FEF3C7",
      badgeText: "#92400E",
      glow: "rgba(217, 119, 6, 0.35)",
    };
  }

  // Default: Royal Blue / Indigo
  return {
    primary: hex,
    primaryHover: "#1E40AF",
    primaryLight: "#DBEAFE",
    primaryText: "#1E40AF",
    sidebarBg: "#091326", // Deep Navy Dark
    sidebarBorder: "#142347",
    sidebarActive: "rgba(29, 78, 216, 0.28)",
    sidebarActiveBorder: "rgba(59, 130, 246, 0.55)",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    glow: "rgba(29, 78, 216, 0.35)",
  };
}

export const THEME_COLOR_PRESETS = [
  { name: "Ruby Crimson", hex: "#DC2626", label: "Red" },
  { name: "Royal Blue", hex: "#1D4ED8", label: "Blue" },
  { name: "Forest Emerald", hex: "#059669", label: "Green" },
  { name: "Deep Violet", hex: "#7C3AED", label: "Violet" },
  { name: "Sunset Amber", hex: "#D97706", label: "Amber" },
];
