// LiveKart Design System - Professional E-commerce Platform
// This file defines the cohesive visual language for the entire application

export const designSystem = {
  // Color Palette - Professional, trustworthy e-commerce colors
  colors: {
    // Primary brand colors - Used for main actions and branding
    primary: {
      50: "#FFF7ED",
      100: "#FFEDD5",
      200: "#FED7AA",
      300: "#FDBA74",
      400: "#FB923C",
      500: "#F97316", // Main primary
      600: "#EA580C",
      700: "#C2410C",
      800: "#9A3412",
      900: "#7C2D12",
    },

    // Secondary - Accent and secondary actions
    secondary: {
      50: "#F0FDF4",
      100: "#DCFCE7",
      200: "#BBF7D0",
      300: "#86EFAC",
      400: "#4ADE80",
      500: "#22C55E", // Main secondary
      600: "#16A34A",
      700: "#15803D",
      800: "#166534",
      900: "#14532D",
    },

    // Neutral - Text, backgrounds, borders
    neutral: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },

    // Semantic colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Background colors
    background: {
      primary: "#FFFFFF",
      secondary: "#F9FAFB",
      tertiary: "#F3F4F6",
    },

    // Text colors
    text: {
      primary: "#111827",
      secondary: "#6B7280",
      tertiary: "#9CA3AF",
      inverse: "#FFFFFF",
    },

    // Border colors
    border: {
      light: "#E5E7EB",
      DEFAULT: "#D1D5DB",
      dark: "#9CA3AF",
    },
  },

  // Typography - Clear hierarchy and readability
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: '"Plus Jakarta Sans", "Inter", sans-serif',
    },

    fontSize: {
      // Body text
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px

      // Headings
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },

    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    lineHeight: {
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
  },

  // Spacing - Consistent rhythm throughout
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
    "4xl": "6rem", // 96px
    "5xl": "8rem", // 128px
  },

  // Border radius - Modern, soft edges
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    DEFAULT: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    full: "9999px",
  },

  // Shadows - Depth and elevation
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT:
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  },

  // Transitions - Smooth, professional animations
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    DEFAULT: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Breakpoints - Responsive design
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-index layers - Consistent stacking
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
};

// Component-specific styles
export const components = {
  button: {
    base: "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    variants: {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary:
        "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500",
      outline:
        "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500",
      ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500",
      danger: "bg-error text-white hover:bg-red-600 focus:ring-error",
    },
    sizes: {
      sm: "px-3 py-1.5 text-sm rounded-md",
      md: "px-4 py-2 text-base rounded-lg",
      lg: "px-6 py-3 text-lg rounded-lg",
      xl: "px-8 py-4 text-xl rounded-xl",
    },
  },

  input: {
    base: "w-full px-4 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed",
    variants: {
      default:
        "border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400",
      error: "border-error bg-red-50 text-neutral-900 placeholder-neutral-400",
    },
  },

  card: {
    base: "bg-white rounded-xl shadow-md transition-shadow duration-200",
    hover: "hover:shadow-lg",
    interactive:
      "cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200",
  },
};

export default designSystem;
