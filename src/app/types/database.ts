// Database types matching Supabase schema

export interface Lead {
  id: string;
  event_id: string;
  collected_by: string;
  account_owner_id: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  profile: ContactProfile; // NEW: Professional background of contact
  geographic_zone: TunisiaRegion;
  client_manager: string; // Auto-filled with logged-in worker's name
  interest_during_visit: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  event?: {
    event_name: string;
    industry?: IndustrySector; // NEW: Industry now comes from event
  };
  collector?: {
    full_name: string;
  };
  owner?: {
    full_name: string;
  };
}

export interface Worker {
  id: string;
  full_name: string;
  email: string | null;
  status: 'active' | 'disabled';
  account_owner_id: string;
  role: 'staff_worker';
  created_at: string;
  updated_at: string;
  // Computed
  leadsCollected?: number;
}

export interface AccountOwner {
  id: string;
  company_name: string;
  company_logo: string | null;
  background_image: string | null;
  language_preference: 'en' | 'fr';
  created_at: string;
  updated_at: string;
  // Joined from profile
  full_name?: string;
  email?: string;
  status?: 'active' | 'disabled';
  // Computed
  totalWorkers?: number;
  totalLeads?: number;
}

export interface EventHistory {
  eventName: string;
  changedAt: string;
}

// NEW: Contact profile types (professional background)
export const CONTACT_PROFILES = [
  'Engineer',
  'Administrator',
  'Manager',
  'Director',
  'CEO/Executive',
  'Sales/Marketing',
  'IT Professional',
  'HR Professional',
  'Finance/Accounting',
  'Operations',
  'Consultant',
  'Technician',
  'Student/Researcher',
  'Other',
] as const;

export type ContactProfile = typeof CONTACT_PROFILES[number];

// Tunisia regions for dropdown
export const TUNISIA_REGIONS = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
] as const;

export type TunisiaRegion = typeof TUNISIA_REGIONS[number];

// Industry sectors
export const INDUSTRY_SECTORS = [
  'Agriculture',
  'Automotive',
  'Banking & Finance',
  'Construction',
  'Education',
  'Energy & Utilities',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Tourism',
  'Information Technology',
  'Manufacturing',
  'Real Estate',
  'Retail',
  'Telecommunications',
  'Transportation & Logistics',
  'Other',
] as const;

export type IndustrySector = typeof INDUSTRY_SECTORS[number];