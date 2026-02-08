import { BRANDING } from '../config/branding';

interface FooterProps {
  variant?: 'light' | 'dark';
}

export function Footer({ variant = 'light' }: FooterProps) {
  const handleClick = (e: React.MouseEvent) => {
    // If platformUrl is '#' (placeholder), prevent navigation
    if (BRANDING.platformUrl === '#') {
      e.preventDefault();
    }
  };

  const isDark = variant === 'dark';

  return (
    <footer className={`py-3 sm:py-4 text-center ${ 
      isDark 
        ? 'bg-transparent border-t border-white/10' 
        : 'bg-white border-t border-[#5CE1E6]/20'
    }`}>
      <p className={`text-xs sm:text-sm ${
        isDark ? 'text-white/80' : 'text-[#6B7280]'
      }`}>
        Powered by{' '}
        <a
          href={BRANDING.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`font-semibold ${
            BRANDING.platformUrl !== '#'
              ? isDark
                ? 'text-white hover:text-[#5CE1E6] hover:underline cursor-pointer'
                : 'text-[#5CE1E6] hover:text-[#5CE1E6]/80 hover:underline cursor-pointer'
              : isDark
                ? 'text-white cursor-default'
                : 'text-[#0F172A] cursor-default'
          }`}
        >
          {BRANDING.companyName}
        </a>
      </p>
    </footer>
  );
}