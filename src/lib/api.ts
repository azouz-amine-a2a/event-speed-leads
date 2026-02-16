import { supabase } from './supabase';
import type { Lead, Worker, AccountOwner } from '../app/types/database';

// ==================== LEADS ====================

export async function fetchLeads(accountOwnerId?: string, eventId?: string, workerId?: string) {
  let query = supabase
    .from('leads')
    .select(`
      id,
      event_id,
      collected_by,
      account_owner_id,
      full_name,
      company,
      email,
      phone,
      profile,
      geographic_zone,
      client_manager,
      interest_during_visit,
      comments,
      created_at,
      updated_at,
      event:events(event_name, industry),
      collector:profiles!collected_by(full_name),
      owner:profiles!account_owner_id(full_name)
    `)
    .order('created_at', { ascending: false });

  if (accountOwnerId) {
    query = query.eq('account_owner_id', accountOwnerId);
  }

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  if (workerId) {
    query = query.eq('collected_by', workerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  return data as Lead[];
}

export async function createLead(leadData: {
  event_id: string;
  collected_by: string;
  account_owner_id: string;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  profile: string; // NEW: Contact profile (professional background)
  geographic_zone: string;
  client_manager: string; // Auto-filled with worker's name
  interest_during_visit?: string | null;
  comments?: string | null;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  return data;
}

// ==================== WORKERS (Staff Workers) ====================

export async function fetchWorkers(accountOwnerId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('account_owner_id', accountOwnerId)
    .eq('role', 'staff_worker')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }

  // Fetch leads count for each worker
  const workersWithCounts = await Promise.all(
    (data || []).map(async (worker) => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('collected_by', worker.id);

      return {
        id: worker.id,
        full_name: worker.full_name,
        email: null, // Email is in auth.users, not in profiles
        status: worker.status as 'active' | 'disabled',
        account_owner_id: worker.account_owner_id!,
        role: worker.role as 'staff_worker',
        created_at: worker.created_at,
        updated_at: worker.updated_at,
        leadsCollected: count || 0,
      } as Worker;
    })
  );

  return workersWithCounts;
}

export async function createStaffWorker(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  // Get the current session to pass auth token and user ID
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token || !session?.user?.id) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = session.access_token;
  const userId = session.user.id;

  // Use raw fetch() to call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/create-staff-worker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-supabase-auth-user-id': userId
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      fullName: data.fullName
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [createStaffWorker] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to create staff worker');
  }

  return result.user;
}

export async function updateWorkerStatus(workerId: string, status: 'active' | 'disabled') {
  const { error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', workerId);

  if (error) {
    console.error('Error updating worker status:', error);
    throw error;
  }
}

export async function updateWorker(data: {
  workerId: string;
  email?: string;
  password?: string;
  fullName?: string;
}) {
  // Get the current session to pass auth token and user ID
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token || !session?.user?.id) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = session.access_token;
  const userId = session.user.id;

  // Use raw fetch() to call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/update-staff-worker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-supabase-auth-user-id': userId
    },
    body: JSON.stringify({
      workerId: data.workerId,
      email: data.email,
      password: data.password,
      fullName: data.fullName
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [updateWorker] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to update worker');
  }

  return result;
}

export async function deleteWorker(workerId: string) {
  // Get the current session to pass auth token and user ID
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token || !session?.user?.id) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = session.access_token;
  const userId = session.user.id;

  // Use raw fetch() to call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/delete-staff-worker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-supabase-auth-user-id': userId
    },
    body: JSON.stringify({ workerId })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [deleteWorker] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to delete worker');
  }

  return result;
}

// ==================== ACCOUNT OWNERS ====================

export async function fetchAccountOwners() {
  // Get access token from session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = session.access_token;

  // Use raw fetch() to call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/get-account-owners', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [fetchAccountOwners] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch account owners');
  }

  return result.accountOwners as AccountOwner[];
}

export async function createAccountOwner(data: {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}) {
  // Get access token from session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = sessionData.session.access_token;

  // Call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/create-account-owner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      companyName: data.companyName
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [createAccountOwner] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to create account owner');
  }

  return result.user;
}

export async function updateAccountOwnerStatus(ownerId: string, status: 'active' | 'disabled') {
  const { error } = await supabase
    .from('profiles')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ownerId);

  if (error) {
    console.error('Error updating account owner status:', error);
    throw error;
  }
}

export async function updateAccountOwner(data: {
  accountOwnerId: string;
  email?: string;
  password?: string;
  fullName?: string;
  companyName?: string;
}) {
  // Get access token from session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = sessionData.session.access_token;

  // Call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/update-account-owner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      accountOwnerId: data.accountOwnerId,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      companyName: data.companyName
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ [updateAccountOwner] Error:', result);
    throw new Error(result.error || `Request failed with status ${response.status}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to update account owner');
  }

  return result;
}

export async function deleteAccountOwner(ownerId: string) {
  // This will cascade delete all related data (workers, leads, etc.)
  const { error } = await supabase.auth.admin.deleteUser(ownerId);

  if (error) {
    console.error('Error deleting account owner:', error);
    throw error;
  }
}

// ==================== EVENTS ====================

export async function fetchCurrentEvent() {
  // Check and auto-deactivate expired events first
  await checkAndDeactivateExpiredEvents();

  console.log('🔍 [API] Fetching active event from database...');
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('❌ [API] Error fetching current event:', error);
    throw error;
  }

  if (error && error.code === 'PGRST116') {
    console.warn('⚠️ [API] No active event found (PGRST116)');
  }

  console.log('✅ [API] Active event result:', data);
  return data;
}

export async function fetchAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  // Check and auto-deactivate expired events
  await checkAndDeactivateExpiredEvents();

  // Re-fetch to get updated data
  const { data: updatedData, error: refetchError } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (refetchError) {
    console.error('Error re-fetching events:', refetchError);
    return data; // Return original data if refetch fails
  }

  return updatedData;
}

export async function checkAndDeactivateExpiredEvents() {
  try {
    // Get all active events
    const { data: activeEvents, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active events:', error);
      return;
    }

    if (!activeEvents || activeEvents.length === 0) {
      return;
    }

    const now = new Date();

    // Check each active event
    for (const event of activeEvents) {
      if (!event.end_date) continue;

      const endDate = new Date(event.end_date);
      const twoDaysAfterEnd = new Date(endDate);
      twoDaysAfterEnd.setDate(twoDaysAfterEnd.getDate() + 2);

      // If current date is past (end_date + 2 days), deactivate
      if (now > twoDaysAfterEnd) {
        await supabase
          .from('events')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', event.id);

        console.log(`Auto-deactivated expired event: ${event.event_name}`);
      }
    }
  } catch (error) {
    console.error('Error checking expired events:', error);
  }
}

export async function createEvent(eventData: {
  event_name: string;
  industry?: string | null; // NEW: Industry sector for this event
  background_image?: string | null;
  logo_image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const { data, error } = await supabase
    .from('events')
    .insert([{ ...eventData, is_active: false }])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
}

export async function setActiveEvent(eventId: string) {
  // The database trigger will automatically deactivate other events
  const { data, error } = await supabase
    .from('events')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error setting active event:', error);
    throw error;
  }

  return data;
}

export async function updateEvent(eventId: string, eventData: {
  event_name?: string;
  industry?: string | null; // NEW: Industry sector for this event
  background_image?: string | null;
  logo_image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const { data, error } = await supabase
    .from('events')
    .update({ ...eventData, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

// ==================== CLIENT MANAGERS ====================
// Client managers are actually staff workers from the same account owner
export async function fetchClientManagers() {
  // Get the current user's account_owner_id from their profile
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error('Not authenticated');
  }

  // First, get the current user's profile to find their account_owner_id
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('profiles')
    .select('account_owner_id')
    .eq('id', authUser.id)
    .single();

  if (profileError || !currentUserProfile?.account_owner_id) {
    console.error('Error fetching user profile:', profileError);
    throw new Error('Could not determine account owner');
  }

  // Fetch staff workers from the same account owner
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, account_owner_id')
    .eq('role', 'staff_worker')
    .eq('account_owner_id', currentUserProfile.account_owner_id)
    .eq('status', 'active')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching client managers:', error);
    throw error;
  }

  return data;
}

// ==================== PROFILE UPDATES ====================

export async function updateProfile(userId: string, data: { full_name?: string }) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function changePassword(newPassword: string) {
  // Supabase only allows authenticated users to change their password
  // No need to verify current password - if they're logged in, they can change it
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Error updating password:', updateError);
    throw updateError;
  }
}

// Owner-specific password change that requires current password verification
export async function changeOwnerPassword(currentPassword: string, newPassword: string) {
  // Get current user email to verify current password
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    throw new Error('User email not found');
  }

  // Verify current password by attempting to sign in with it
  // We'll use a separate client instance to avoid affecting the current session
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error('Current password is incorrect');
  }

  // If verification succeeds, update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error('Error updating password:', updateError);
    throw updateError;
  }
}

export async function updateAccountOwnerSettings(
  ownerId: string,
  data: {
    company_name?: string;
    company_logo?: string | null;
    background_image?: string | null;
    language_preference?: 'en' | 'fr';
  }
) {
  const { error } = await supabase
    .from('account_owners')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', ownerId);

  if (error) {
    console.error('Error updating account owner settings:', error);
    throw error;
  }
}

// ==================== CSV EXPORT ====================

export async function exportLeadsToCSV(filters?: {
  accountOwnerId?: string;
  workerId?: string;
  eventId?: string;
}) {
  // Get the current session to pass auth token and user ID
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.access_token || !session?.user?.id) {
    throw new Error('No active session found. Please log in again.');
  }

  const token = session.access_token;
  const userId = session.user.id;

  // Use raw fetch() to call the Edge Function
  const response = await fetch('https://lnxhfzsmmcqstpwobqiv.supabase.co/functions/v1/export-leads-csv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-supabase-auth-user-id': userId
    },
    body: JSON.stringify(filters || {})
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('❌ [exportLeadsToCSV] Error:', errorData);
    console.error('❌ [exportLeadsToCSV] Status:', response.status);
    console.error('❌ [exportLeadsToCSV] Filters sent:', filters);
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  // Return the CSV text
  const csvText = await response.text();
  return csvText;
}

// ==================== STATISTICS ====================

export async function fetchStatistics(accountOwnerId?: string) {
  // Total leads
  let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true });

  if (accountOwnerId) {
    leadsQuery = leadsQuery.eq('account_owner_id', accountOwnerId);
  }

  const { count: totalLeads } = await leadsQuery;

  // Total workers
  let workersQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'staff_worker')
    .eq('status', 'active');

  if (accountOwnerId) {
    workersQuery = workersQuery.eq('account_owner_id', accountOwnerId);
  }

  const { count: totalWorkers } = await workersQuery;

  return {
    totalLeads: totalLeads || 0,
    totalWorkers: totalWorkers || 0,
  };
}

// ==================== FILE UPLOADS (Supabase Storage) ====================

export async function uploadImage(file: File, bucket: string, folder: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteImage(bucket: string, filePath: string) {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// ============================================
// FILE UPLOAD FUNCTIONS
// ============================================

/**
 * Upload a logo file for an account owner
 */
export async function uploadAccountOwnerLogo(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('acount owners logo')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading logo:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('Storage permissions not configured. Please contact administrator.');
    }
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('acount owners logo')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a background image for an account owner
 */
export async function uploadAccountOwnerBackground(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('acount owners bg')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading background:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('Storage permissions not configured. Please contact administrator.');
    }
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('acount owners bg')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a logo file for super admin (event settings)
 */
export async function uploadAdminLogo(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('admin logo')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading admin logo:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('Storage permissions not configured. Please contact administrator.');
    }
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('admin logo')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a background image for super admin (event settings)
 */
export async function uploadAdminBackground(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('admin bg')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading admin background:', error);
    if (error.message.includes('row-level security')) {
      throw new Error('Storage permissions not configured. Please contact administrator.');
    }
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('admin bg')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPG, PNG, or WebP image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
}

// ============================================
// EXISTING FUNCTIONS CONTINUE BELOW
// ============================================
