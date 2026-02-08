import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { BRANDING } from '../config/branding';
import { Building2, Lock, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Footer } from '../components/Footer';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const { eventName, backgroundImage, logoImage, hasActiveEvent, isLoading: isEventLoading } = useEvent();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'staff':
          navigate('/staff');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
    // Navigation will be handled by the useEffect above
  };

  // Show loading state while checking for active event
  if (isEventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Show special design when no active event
  if (!hasActiveEvent) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#0F172A]/95 to-[#5CE1E6]/20">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-2xl text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5CE1E6] rounded-3xl mb-6 shadow-2xl">
              <Calendar className="w-10 h-10 text-[#0F172A]" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              No Active Event
            </h1>

            {/* Message */}
            <p className="text-lg sm:text-xl text-[#EAFBFC] mb-8 max-w-xl mx-auto">
              There is currently no active event. Staff workers cannot log in at this time. Please contact your administrator to activate an event.
            </p>

            {/* Info Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-[#5CE1E6]/30 rounded-2xl p-6 max-w-md mx-auto">
              <div className="flex items-start gap-3 text-left">
                <AlertCircle className="w-6 h-6 text-[#5CE1E6] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Administrator Access</h3>
                  <p className="text-sm text-[#EAFBFC]">
                    If you are an administrator, please sign in to activate or create a new event in the Event Management section.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Login Button */}
            <button
              onClick={() => {
                // Show a simple admin login form
                const adminSection = document.getElementById('admin-login-section');
                if (adminSection) {
                  adminSection.classList.toggle('hidden');
                }
              }}
              className="mt-8 text-[#5CE1E6] hover:text-[#5CE1E6]/80 underline transition-colors"
            >
              Administrator Sign In
            </button>

            {/* Hidden Admin Login Section */}
            <div id="admin-login-section" className="hidden mt-6">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto">
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Administrator Sign In</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[#0F172A] mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6] focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[#0F172A] mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6] focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-[#FF5757]/10 border border-[#FF5757] text-[#FF5757] px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 text-[#0F172A] font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <Footer variant="dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Event background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/80 via-[#0F172A]/70 to-[#5CE1E6]/30"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and Event Name */}
          <div className="text-center mb-6 sm:mb-8">
            {logoImage ? (
              <div className="inline-flex items-center justify-center mb-4">
                <img
                  src={logoImage}
                  alt={`${eventName} logo`}
                  className="max-h-20 sm:max-h-24 max-w-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback to default icon if logo fails to load
                    e.currentTarget.style.display = 'none';
                    const fallbackIcon = document.getElementById('fallback-logo-icon');
                    if (fallbackIcon) {
                      fallbackIcon.style.display = 'inline-flex';
                    }
                  }}
                />
                <div
                  id="fallback-logo-icon"
                  className="hidden items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#5CE1E6] rounded-2xl shadow-lg"
                >
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#0F172A]" />
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#5CE1E6] rounded-2xl mb-4 shadow-lg">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#0F172A]" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {eventName}
            </h1>
            <p className="text-sm sm:text-base text-[#EAFBFC]">{BRANDING.platformTagline}</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6">Sign In</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6] focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#0F172A] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6] focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-[#FF5757]/10 border border-[#FF5757] text-[#FF5757] px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 text-[#0F172A] font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <Footer variant="dark" />
      </div>
    </div>
  );
}