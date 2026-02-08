import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, type Profile, type AccountOwner, type UserRole } from '../../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Map database roles to frontend roles
export type UserRoleDisplay = 'staff' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleDisplay;
  companyName?: string;
  companyLogo?: string | null;
  backgroundImage?: string | null;
  languagePreference?: 'en' | 'fr';
  status?: string;
  accountOwnerId?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapDatabaseRoleToDisplay(dbRole: UserRole): UserRoleDisplay {
  switch (dbRole) {
    case 'super_admin':
      return 'admin';
    case 'account_owner':
      return 'owner';
    case 'staff_worker':
      return 'staff';
    default:
      return 'staff';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      const profileData = profile as Profile;

      // Fetch account owner info if applicable
      let accountOwnerData: AccountOwner | null = null;
      if (profileData.role === 'account_owner') {
        const { data: owner } = await supabase
          .from('account_owners')
          .select('*')
          .eq('id', userId)
          .single();
        accountOwnerData = owner as AccountOwner;
      } else if (profileData.role === 'staff_worker' && profileData.account_owner_id) {
        const { data: owner } = await supabase
          .from('account_owners')
          .select('*')
          .eq('id', profileData.account_owner_id)
          .single();
        accountOwnerData = owner as AccountOwner;
      }

      const mappedUser: User = {
        id: userId,
        name: profileData.full_name,
        email: userEmail, // Get email from auth.users table
        role: mapDatabaseRoleToDisplay(profileData.role),
        companyName: accountOwnerData?.company_name,
        companyLogo: accountOwnerData?.company_logo,
        backgroundImage: accountOwnerData?.background_image,
        languagePreference: accountOwnerData?.language_preference,
        status: profileData.status,
        accountOwnerId: profileData.account_owner_id,
      };

      setUser(mappedUser);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use standard Supabase email/password authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message || 'Invalid email or password' };
      }

      if (!data.session) {
        return { success: false, error: 'Login failed - no session created' };
      }

      // Fetch user profile to check role
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Check if user is staff and if there's an active event
        if (profile?.role === 'staff_worker') {
          const { data: activeEvent } = await supabase
            .from('events')
            .select('id')
            .eq('is_active', true)
            .maybeSingle();

          if (!activeEvent) {
            // Log out the staff worker immediately
            await supabase.auth.signOut();
            return { 
              success: false, 
              error: 'No active event. Staff workers cannot log in when there is no active event. Please contact your administrator.' 
            };
          }
        }

        // Set session and load user profile
        setSession(data.session);
        await loadUserProfile(data.user.id, data.user.email || '');
      }

      // The auth state change listener will also handle setting the user
      return { success: true };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      // Get the current session to get the email
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(user.id, session.user.email || '');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}