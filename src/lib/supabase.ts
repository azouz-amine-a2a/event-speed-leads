import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lnxhfzsmmcqstpwobqiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueGhmenNtbWNxc3Rwd29icWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTQ0NDksImV4cCI6MjA4NTg3MDQ0OX0.yDV8ZPmB9sk6PbZLFfZiK9Au3TgrBySSiEV8SSINyUs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Database Types
export type UserRole = 'super_admin' | 'account_owner' | 'staff_worker';
export type AccountStatus = 'active' | 'disabled';
export type TunisiaRegion =
  | 'Tunis'
  | 'Ariana'
  | 'Ben Arous'
  | 'Manouba'
  | 'Nabeul'
  | 'Zaghouan'
  | 'Bizerte'
  | 'Béja'
  | 'Jendouba'
  | 'Kef'
  | 'Siliana'
  | 'Sousse'
  | 'Monastir'
  | 'Mahdia'
  | 'Sfax'
  | 'Kairouan'
  | 'Kasserine'
  | 'Sidi Bouzid'
  | 'Gabès'
  | 'Medenine'
  | 'Tataouine'
  | 'Gafsa'
  | 'Tozeur'
  | 'Kebili';

export type IndustrySector =
  | 'Agriculture'
  | 'Automotive'
  | 'Banking & Finance'
  | 'Construction'
  | 'Education'
  | 'Energy & Utilities'
  | 'Food & Beverage'
  | 'Healthcare'
  | 'Hospitality & Tourism'
  | 'Information Technology'
  | 'Manufacturing'
  | 'Real Estate'
  | 'Retail'
  | 'Telecommunications'
  | 'Transportation & Logistics'
  | 'Other';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  account_owner_id: string | null;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface AccountOwner {
  id: string;
  company_name: string;
  company_logo: string | null;
  background_image: string | null;
  language_preference: 'en' | 'fr';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_name: string;
  background_image: string | null;
  logo_image: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientManager {
  id: string;
  full_name: string;
  created_at: string;
}

export interface Lead {
  id: string;
  event_id: string;
  collected_by: string;
  account_owner_id: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  industry_sector: IndustrySector;
  custom_industry: string | null;
  geographic_zone: TunisiaRegion;
  client_manager: string;
  interest_during_visit: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}