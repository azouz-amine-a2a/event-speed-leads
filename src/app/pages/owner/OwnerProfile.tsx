import { useState, useEffect, useRef } from 'react';
import { User, Building2, Save, Globe, Image as ImageIcon, Upload, X, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';
import {
  updateProfile,
  updateAccountOwnerSettings,
  uploadAccountOwnerLogo,
  uploadAccountOwnerBackground,
  validateImageFile,
  changeOwnerPassword,
} from '../../../lib/api';

export function OwnerProfile() {
  const { user, refreshUser } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyLogo, setCompanyLogo] = useState(user?.companyLogo || '');
  const [backgroundImage, setBackgroundImage] = useState(user?.backgroundImage || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr'>(
    (user?.languagePreference as 'en' | 'fr') || language
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setCompanyName(user.companyName || '');
      setCompanyLogo(user.companyLogo || '');
      setBackgroundImage(user.backgroundImage || '');
      setSelectedLanguage((user.languagePreference as 'en' | 'fr') || language);
    }
  }, [user, language]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingLogo(true);

    try {
      const url = await uploadAccountOwnerLogo(file, user.id);
      setCompanyLogo(url);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      
      if (errorMessage.includes('Storage permissions')) {
        toast.error('Storage not configured', {
          description: 'Please ask your administrator to configure storage permissions.',
        });
      } else {
        toast.error('Failed to upload logo', {
          description: errorMessage,
        });
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingBackground(true);

    try {
      const url = await uploadAccountOwnerBackground(file, user.id);
      setBackgroundImage(url);
      toast.success('Background image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading background:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload background image';
      
      if (errorMessage.includes('Storage permissions')) {
        toast.error('Storage not configured', {
          description: 'Please ask your administrator to configure storage permissions.',
        });
      } else {
        toast.error('Failed to upload background image', {
          description: errorMessage,
        });
      }
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!fullName.trim() || !companyName.trim()) {
      toast.error(t('profile.fillRequired') || 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      // Update profile
      await updateProfile(user!.id, {
        full_name: fullName,
      });

      // Update account owner settings
      await updateAccountOwnerSettings(user!.id, {
        company_name: companyName,
        company_logo: companyLogo || null,
        background_image: backgroundImage || null,
        language_preference: selectedLanguage,
      });

      // Update language context
      setLanguage(selectedLanguage);

      // Store language preference in localStorage
      localStorage.setItem('app_language_preference', selectedLanguage);

      toast.success(t('profile.updated') || 'Profile updated successfully!');

      // Refresh user data without reloading the page
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.updateError') || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      toast.error(t('profile.fillPasswordFields') || 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(t('profile.passwordMismatch') || 'New passwords do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeOwnerPassword(currentPassword, newPassword);
      toast.success(t('profile.passwordChanged') || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(t('profile.passwordChangeError') || 'Failed to change password', {
        description: errorMessage,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('profile.title') || 'Profile Settings'}
        </h1>
        <p className="text-slate-600 mt-1">
          {t('profile.subtitle') || 'Manage your account and company information'}
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('profile.personalInfo') || 'Personal Information'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.fullName') || 'Full Name'} *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.email') || 'Email'}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('profile.emailNote') || 'Email cannot be changed'}
            </p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('profile.companyInfo') || 'Company Information'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.companyName') || 'Company Name'} *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Company Branding */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <ImageIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('profile.companyBranding') || 'Company Branding'}
            </h2>
            <p className="text-sm text-slate-600">
              {t('profile.companyBrandingDescription') ||
                'Customize your company logo and background (appears on staff contact forms)'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.companyLogo') || 'Company Logo'}
            </label>

            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {companyLogo ? (
                  <div className="relative">
                    <img
                      src={companyLogo}
                      alt="Company logo"
                      className="w-24 h-24 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/96?text=Logo';
                      }}
                    />
                    <button
                      onClick={() => setCompanyLogo('')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingLogo
                    ? t('profile.uploading') || 'Uploading...'
                    : t('profile.uploadCompanyLogo') || 'Upload Company Logo'}
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  {t('profile.logoRecommendation') ||
                    'Recommended: Square image, minimum 200x200px, JPG/PNG/WebP format, max 5MB'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {t('profile.logoHelp') ||
                    'This logo will appear on the staff contact form splash screen'}
                </p>
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.companyBackground') || 'Contact Form Background'}
            </label>

            <div className="space-y-4">
              {/* Preview */}
              {backgroundImage ? (
                <div className="relative h-48 rounded-lg overflow-hidden border-2 border-slate-200">
                  <img
                    src={backgroundImage}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/800x300?text=Background';
                    }}
                  />
                  <button
                    onClick={() => setBackgroundImage('')}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    title="Remove background"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-48 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {t('profile.noBackgroundUploaded') || 'No background image uploaded'}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  ref={backgroundInputRef}
                  onChange={handleBackgroundUpload}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  disabled={isUploadingBackground}
                  className="px-4 py-2 bg-[#5CE1E6] text-[#0F172A] rounded-lg hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingBackground
                    ? t('profile.uploading') || 'Uploading...'
                    : t('profile.uploadBackground') || 'Upload Background Image'}
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  {t('profile.backgroundRecommendation') ||
                    'Recommended: 1920x1080px or larger, JPG/PNG/WebP format, max 5MB'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {t('profile.backgroundHelp') ||
                    'Background for the staff contact form splash screen'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Globe className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('profile.language') || 'Language Preference'}
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('profile.selectLanguage') || 'Select Language'}
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'fr')}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t('profile.changePassword') || 'Change Password'}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.currentPassword') || 'Current Password'} *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.newPassword') || 'New Password'} *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('profile.confirmNewPassword') || 'Confirm New Password'} *
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:bg-red-400"
          >
            <Lock className="w-5 h-5" />
            {isChangingPassword
              ? t('profile.changingPassword') || 'Changing...'
              : t('profile.changePassword') || 'Change Password'}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 text-[#0F172A] px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:bg-[#5CE1E6]/50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? t('profile.saving') || 'Saving...' : t('profile.saveChanges') || 'Save Changes'}
        </button>
      </div>
    </div>
  );
}