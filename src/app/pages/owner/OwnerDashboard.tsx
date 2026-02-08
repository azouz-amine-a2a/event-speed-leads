import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BRANDING } from '../../config/branding';
import { Footer } from '../../components/Footer';
import { Building2, BarChart3, Users, FileDown, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function OwnerDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/owner/overview', label: t('nav.overview'), icon: Building2 },
    { path: '/owner/workers', label: t('nav.workers'), icon: Users },
    { path: '/owner/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { path: '/owner/export', label: t('nav.export'), icon: FileDown },
    { path: '/owner/profile', label: t('nav.profile'), icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#EAFBFC] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-[#5CE1E6]/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5CE1E6] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#0F172A]">{BRANDING.platformName}</h1>
              <p className="text-xs text-[#6B7280]">Account Owner</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#6B7280] hover:bg-[#EAFBFC] rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 bg-white border-r border-[#5CE1E6]/20
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b border-[#5CE1E6]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#5CE1E6] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0F172A]">{BRANDING.platformName}</h1>
                <p className="text-xs text-[#6B7280]">{BRANDING.platformTagline}</p>
              </div>
            </div>
            <div className="bg-[#5CE1E6]/10 border border-[#5CE1E6]/30 rounded-lg p-3">
              <p className="text-xs font-medium text-[#0F172A] mb-1">{t('nav.loggedInAs')}</p>
              <p className="text-sm font-semibold text-[#0F172A]">{user?.name}</p>
              <p className="text-xs text-[#6B7280]">{user?.email}</p>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="lg:hidden p-4 border-b border-[#5CE1E6]/20 bg-[#EAFBFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5CE1E6]/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#5CE1E6]">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{user?.name}</p>
                <p className="text-xs text-[#6B7280]">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-[#5CE1E6]/10 text-[#5CE1E6] font-semibold'
                            : 'text-[#0F172A] hover:bg-[#EAFBFC]'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#5CE1E6]/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#FF5757] hover:bg-[#FF5757]/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        
        <Footer />
      </main>
    </div>
  );
}