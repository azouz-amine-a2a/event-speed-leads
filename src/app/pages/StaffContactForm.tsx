import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { CONTACT_PROFILES, TUNISIA_REGIONS } from '../types/database'; // CHANGED: Import CONTACT_PROFILES instead of INDUSTRY_SECTORS
import { Building2, LogOut, Save, RotateCcw, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Footer } from '../components/Footer';
import { createLead, fetchCurrentEvent } from '../../lib/api'; // CHANGED: Removed fetchClientManagers
import { useLanguage } from '../context/LanguageContext';

export function StaffContactForm() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage(); // NEW: Add translations

  // Form state
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState(''); // NEW: Contact profile instead of industry
  const [geographicZone, setGeographicZone] = useState('');
  const [interestDuringVisit, setInterestDuringVisit] = useState('');
  const [comments, setComments] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Touch gesture state for swipe detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Data loading
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Company branding from user's account owner
  const companyLogo = user?.companyLogo;
  const backgroundImage = user?.backgroundImage;
  const companyName = user?.companyName || 'Company';

  useEffect(() => {
    if (!user || user.role !== 'staff') {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current event
      const event = await fetchCurrentEvent();
      setCurrentEvent(event);

      // If no active event, log out staff worker
      if (!event) {
        toast.error('No active event. You cannot access the contact form.', {
          description: 'Please contact your administrator.',
        });
        await logout();
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentEvent) {
        toast.error('No active event found');
        return;
      }

      await createLead({
        event_id: currentEvent.id,
        collected_by: user!.id,
        account_owner_id: user!.accountOwnerId!,
        full_name: fullName,
        company,
        email,
        phone,
        profile, // NEW: Use profile instead of industry_sector
        geographic_zone: geographicZone,
        client_manager: user!.name || 'Unknown', // NEW: Auto-fill with logged-in worker's name
        interest_during_visit: interestDuringVisit || null,
        comments: comments || null,
      });

      toast.success('Lead submitted successfully!');
      handleReset();
      setShowSplash(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setProfile(''); // NEW: Reset profile
    setGeographicZone('');
    setInterestDuringVisit('');
    setComments('');
  };

  const handleResetClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleReset();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    
    if (isUpSwipe) {
      setShowSplash(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAFBFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CE1E6] mx-auto"></div>
          <p className="mt-4 text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : 'linear-gradient(135deg, #5CE1E6 0%, #0F172A 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/60 via-[#5CE1E6]/20 to-[#0F172A]/60"></div>

        <div className="relative z-10 text-center px-6">
          {companyLogo && (
            <img
              src={companyLogo}
              alt={companyName}
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8 object-contain drop-shadow-2xl"
            />
          )}
          {!companyLogo && (
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {companyName}
          </h1>
          <p className="text-lg sm:text-xl text-[#EAFBFC] mb-12 drop-shadow-md">
            Lead Collection System
          </p>

          <div className="flex flex-col items-center gap-4 animate-bounce">
            <ChevronUp className="w-8 h-8 text-white" />
            <button
              onClick={() => setShowSplash(false)}
              className="bg-white text-[#5CE1E6] px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:bg-[#EAFBFC] transition-all duration-300 transform hover:scale-105"
            >
              Swipe Up to Start
            </button>
            <ChevronUp className="w-8 h-8 text-white" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors duration-200 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <Footer variant="dark" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAFBFC] flex flex-col">
      <div className="bg-gradient-to-r from-[#5CE1E6] to-[#5CE1E6]/80 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-10 h-10 object-contain bg-white rounded-lg p-1"
              />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
            <div>
              <h1 className="font-bold text-lg">{companyName}</h1>
              <p className="text-xs text-[#EAFBFC]">Logged in as: {user?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Contact Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    placeholder="+216 XX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    {t('form.profile')} *
                  </label>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    required
                  >
                    <option value="">{t('form.profile.placeholder')}</option>
                    {CONTACT_PROFILES.map((profileOption) => {
                      // Map profile values to translation keys
                      const profileKey = profileOption
                        .toLowerCase()
                        .replace(/\//g, '')
                        .replace(/\s+/g, '')
                        .replace('ceoexecutive', 'ceo')
                        .replace('salesmarketing', 'sales')
                        .replace('itprofessional', 'it')
                        .replace('hrprofessional', 'hr')
                        .replace('financeaccounting', 'finance')
                        .replace('studentresearcher', 'student');
                      
                      return (
                        <option key={profileOption} value={profileOption}>
                          {t(`profile.${profileKey}`)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Geographic Zone *
                  </label>
                  <select
                    value={geographicZone}
                    onChange={(e) => setGeographicZone(e.target.value)}
                    className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                    required
                  >
                    <option value="">Select Region</option>
                    {TUNISIA_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Interest During Visit
                </label>
                <textarea
                  value={interestDuringVisit}
                  onChange={(e) => setInterestDuringVisit(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                  placeholder="What were they interested in?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-[#6B7280]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CE1E6]"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 text-[#0F172A] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Submitting...' : 'Submit Lead'}
                </button>
                <button
                  type="button"
                  onClick={handleResetClick}
                  className="bg-[#6B7280]/20 hover:bg-[#6B7280]/30 text-[#0F172A] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}