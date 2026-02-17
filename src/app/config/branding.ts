/**
 * Centralized Branding Configuration
 * 
 * Update this file to change the platform's branding across the entire application.
 * All colors, logos, and platform names are defined here for easy customization.
 */

export const BRANDING = {
  // Platform Information
  platformName: 'Event Speed Leads',
  platformTagline: 'Lead Collection System',
  
  // Company/Provider Information (for "Powered by" footer)
  companyName: 'PhenixCom',
  platformUrl: 'https://phenixcom.consulting',
  
  // Logo Configuration
  // You can replace this with your actual logo URL or import
  logoUrl: null, // Set to null to use icon, or provide URL like: '/assets/logo.png'
  logoIcon: 'Building2', // Lucide icon name when no logo URL is provided
  
  // Color Palette
  colors: {
    // Primary Brand Color (used for main actions, highlights)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main primary color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary Brand Color (used for secondary actions, accents)
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Main secondary color
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    
    // Success Color
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    // Warning Color
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    // Error Color
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    // Neutral Colors (grays)
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  
  // Role-specific colors (for role badges, indicators)
  roleColors: {
    admin: {
      bg: '#eff6ff',
      text: '#1e40af',
      border: '#93c5fd',
    },
    owner: {
      bg: '#faf5ff',
      text: '#6b21a8',
      border: '#d8b4fe',
    },
    staff: {
      bg: '#f0fdf4',
      text: '#15803d',
      border: '#86efac',
    },
  },
} as const;

/**
 * Helper function to get Tailwind-compatible color classes
 * This allows dynamic color generation based on the branding config
 */
export const getBrandColors = () => {
  return {
    // Primary colors
    primaryBg: 'bg-blue-600 hover:bg-blue-700',
    primaryText: 'text-blue-600',
    primaryBorder: 'border-blue-600',
    primaryLight: 'bg-blue-100',
    primaryLightText: 'text-blue-700',
    
    // Secondary colors
    secondaryBg: 'bg-purple-600 hover:bg-purple-700',
    secondaryText: 'text-purple-600',
    secondaryBorder: 'border-purple-600',
    secondaryLight: 'bg-purple-100',
    secondaryLightText: 'text-purple-700',
    
    // Success colors
    successBg: 'bg-green-600 hover:bg-green-700',
    successText: 'text-green-600',
    successLight: 'bg-green-100',
    
    // Warning colors
    warningBg: 'bg-amber-600 hover:bg-amber-700',
    warningText: 'text-amber-600',
    warningLight: 'bg-amber-100',
    
    // Error colors
    errorBg: 'bg-red-600 hover:bg-red-700',
    errorText: 'text-red-600',
    errorLight: 'bg-red-100',
  };
};

/**
 * Instructions for customization:
 * 
 * 1. PLATFORM NAME & TAGLINE:
 *    - Update `platformName` and `platformTagline` with your branding
 * 
 * 2. LOGO:
 *    - Option A: Set `logoUrl` to your logo image path (e.g., '/assets/logo.png')
 *    - Option B: Keep `logoUrl` as null and set `logoIcon` to a Lucide icon name
 * 
 * 3. COLORS:
 *    - Modify the color values in hex format (#RRGGBB)
 *    - Keep the shade structure (50-900) for consistent theming
 *    - Primary: Main brand color for buttons, links, highlights
 *    - Secondary: Accent color for secondary actions
 *    - Adjust other colors as needed
 * 
 * 4. AFTER CHANGES:
 *    - The entire application will automatically use your new branding
 *    - No need to modify individual components
 */
