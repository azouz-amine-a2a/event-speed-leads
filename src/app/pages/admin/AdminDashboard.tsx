import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { BRANDING } from '../../config/branding';
import { Footer } from '../../components/Footer';
import { Building, BarChart3, Settings, LogOut, Shield, Calendar, Database, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/overview', label: 'System Overview', icon: LayoutDashboard },
    { path: '/admin/accounts', label: 'Account Owners', icon: Building },
    { path: '/admin/data-export', label: 'Data Export', icon: Database },
    { path: '/admin/event-management', label: 'Event Management', icon: Calendar },
    { path: '/admin/profile', label: 'Profile Settings', icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#EAFBFC] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-[#5CE1E6]/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5CE1E6] to-[#5CE1E6]/70 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#0F172A]">{BRANDING.platformName}</h1>
              <p className="text-xs text-[#6B7280]">Super Admin</p>
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
          {/* Desktop Logo Section */}
          <div className="hidden lg:block p-6 border-b border-[#5CE1E6]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5CE1E6] to-[#5CE1E6]/70 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#0F172A]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0F172A]">{BRANDING.platformName}</h1>
                <p className="text-xs text-[#6B7280]">Super Admin Panel</p>
              </div>
            </div>
            <div className="bg-[#5CE1E6]/10 border border-[#5CE1E6]/30 rounded-lg p-3">
              <p className="text-xs font-medium text-[#0F172A] mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-[#0F172A]">{user?.name}</p>
              <p className="text-xs text-[#6B7280]">{user?.email}</p>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="lg:hidden p-4 border-b border-[#5CE1E6]/20 bg-[#EAFBFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5CE1E6] to-[#5CE1E6]/70 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-[#0F172A]">
                  {user?.name?.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A]">{user?.name}</p>
                <p className="text-xs text-[#6B7280]">Super Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
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
              <span className="font-medium">Logout</span>
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