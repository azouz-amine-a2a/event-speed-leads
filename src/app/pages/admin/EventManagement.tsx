import { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, CheckCircle, Circle, AlertCircle, Edit2, Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAllEvents, createEvent, setActiveEvent, updateEvent, uploadAdminLogo, uploadAdminBackground, validateImageFile } from '../../../lib/api';
import type { Event } from '../../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { INDUSTRY_SECTORS } from '../../types/database'; // NEW: Import industry sectors
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import { DatePicker } from '../../components/ui/date-picker';
import { Switch } from '../../components/ui/switch';

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventIndustry, setNewEventIndustry] = useState(''); // NEW: Industry for new event
  const [newEventStartDate, setNewEventStartDate] = useState<Date | undefined>(undefined);
  const [newEventEndDate, setNewEventEndDate] = useState<Date | undefined>(undefined);
  const [newLogoImage, setNewLogoImage] = useState('');
  const [newBackgroundImage, setNewBackgroundImage] = useState('');
  const [newLogoInputMode, setNewLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [newBackgroundInputMode, setNewBackgroundInputMode] = useState<'upload' | 'url'>('upload');
  const [newLogoUrlInput, setNewLogoUrlInput] = useState('');
  const [newBackgroundUrlInput, setNewBackgroundUrlInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingNewLogo, setIsUploadingNewLogo] = useState(false);
  const [isUploadingNewBackground, setIsUploadingNewBackground] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState<Event | null>(null);
  const [updatedEventName, setUpdatedEventName] = useState('');
  const [updatedIndustry, setUpdatedIndustry] = useState(''); // NEW: Industry for event update
  const [updatedStartDate, setUpdatedStartDate] = useState<Date | undefined>(undefined);
  const [updatedEndDate, setUpdatedEndDate] = useState<Date | undefined>(undefined);
  const [updatedLogoImage, setUpdatedLogoImage] = useState('');
  const [updatedBackgroundImage, setUpdatedBackgroundImage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [backgroundInputMode, setBackgroundInputMode] = useState<'upload' | 'url'>('upload');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('');
  const { user } = useAuth();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const newLogoInputRef = useRef<HTMLInputElement>(null);
  const newBackgroundInputRef = useRef<HTMLInputElement>(null);
  
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim() || !newEventStartDate || !newEventEndDate) {
      toast.error('Please enter all event details');
      return;
    }

    setIsCreating(true);
    try {
      await createEvent({ 
        event_name: newEventName.trim(), 
        start_date: newEventStartDate, 
        end_date: newEventEndDate,
        logo_image: newLogoImage || null,
        background_image: newBackgroundImage || null,
        industry: newEventIndustry || null, // NEW: Add industry to event creation
      });
      toast.success('Event created successfully!', {
        description: 'You can now set it as the active event.',
      });
      setNewEventName('');
      setNewEventIndustry(''); // NEW: Reset industry field
      setNewEventStartDate(undefined);
      setNewEventEndDate(undefined);
      setNewLogoImage('');
      setNewBackgroundImage('');
      setNewLogoUrlInput('');
      setNewBackgroundUrlInput('');
      setShowCreateDialog(false);
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (event: Event) => {
    try {
      if (event.is_active) {
        // Deactivate this event
        await updateEvent(event.id, { is_active: false });
        toast.success('Event deactivated!', {
          description: `"${event.event_name}" has been deactivated.`,
        });
      } else {
        // Activate this event (will automatically deactivate others)
        await setActiveEvent(event.id);
        toast.success('Event activated!', {
          description: `"${event.event_name}" is now the active event.`,
        });
      }
      loadEvents();
    } catch (error) {
      console.error('Error toggling event:', error);
      toast.error('Failed to toggle event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventToUpdate || !updatedEventName.trim() || !updatedStartDate || !updatedEndDate) {
      toast.error('Please enter all event details');
      return;
    }

    setIsUpdating(true);
    try {
      await updateEvent(eventToUpdate.id, { 
        event_name: updatedEventName.trim(), 
        start_date: updatedStartDate, 
        end_date: updatedEndDate,
        logo_image: updatedLogoImage || null,
        background_image: updatedBackgroundImage || null,
        industry: updatedIndustry || null, // NEW: Add industry to event update
      });
      toast.success('Event updated successfully!');
      setEventToUpdate(null);
      setUpdatedEventName('');
      setUpdatedStartDate(undefined);
      setUpdatedEndDate(undefined);
      setUpdatedLogoImage('');
      setUpdatedBackgroundImage('');
      setLogoUrlInput('');
      setBackgroundUrlInput('');
      loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setIsUpdating(false);
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleApplyLogoUrl = () => {
    const trimmedUrl = logoUrlInput.trim();
    
    if (!trimmedUrl) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP/HTTPS image URL',
      });
      return;
    }

    setUpdatedLogoImage(trimmedUrl);
    toast.success('Logo URL applied!');
  };

  const handleApplyBackgroundUrl = () => {
    const trimmedUrl = backgroundUrlInput.trim();
    
    if (!trimmedUrl) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP/HTTPS image URL',
      });
      return;
    }

    setUpdatedBackgroundImage(trimmedUrl);
    toast.success('Background URL applied!');
  };

  const handleApplyNewLogoUrl = () => {
    const trimmedUrl = newLogoUrlInput.trim();
    
    if (!trimmedUrl) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP/HTTPS image URL',
      });
      return;
    }

    setNewLogoImage(trimmedUrl);
    toast.success('Logo URL applied!');
  };

  const handleApplyNewBackgroundUrl = () => {
    const trimmedUrl = newBackgroundUrlInput.trim();
    
    if (!trimmedUrl) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid HTTP/HTTPS image URL',
      });
      return;
    }

    setNewBackgroundImage(trimmedUrl);
    toast.success('Background URL applied!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingLogo(true);

    try {
      const url = await uploadAdminLogo(file, user.id);
      setUpdatedLogoImage(url);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      toast.error('Failed to upload logo', {
        description: errorMessage,
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingBackground(true);

    try {
      const url = await uploadAdminBackground(file, user.id);
      setUpdatedBackgroundImage(url);
      toast.success('Background image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading background:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload background image';
      toast.error('Failed to upload background image', {
        description: errorMessage,
      });
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const handleNewLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingNewLogo(true);

    try {
      const url = await uploadAdminLogo(file, user.id);
      setNewLogoImage(url);
      toast.success('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      toast.error('Failed to upload logo', {
        description: errorMessage,
      });
    } finally {
      setIsUploadingNewLogo(false);
    }
  };

  const handleNewBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploadingNewBackground(true);

    try {
      const url = await uploadAdminBackground(file, user.id);
      setNewBackgroundImage(url);
      toast.success('Background image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading background:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload background image';
      toast.error('Failed to upload background image', {
        description: errorMessage,
      });
    } finally {
      setIsUploadingNewBackground(false);
    }
  };

  const activeEvent = events.find((e) => e.is_active);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Calendar className="size-7 text-blue-600" />
              Event Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create and manage events<br />
              Only one event can be active at a time.
            </p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-[#5CE1E6] px-4 py-2 text-sm font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#5CE1E6]/90"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Event</span>
          </button>
        </div>

        {/* Active Event Card */}
        {activeEvent && (
          <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 size-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-slate-900">Currently Active Event</h3>
                  <p className="mt-1 text-lg font-medium text-slate-800">{activeEvent.event_name}</p>
                  {activeEvent.start_date && activeEvent.end_date && (
                    <p className="text-xs text-slate-600">
                      {new Date(activeEvent.start_date).toLocaleDateString()} - {new Date(activeEvent.end_date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-600">
                    Created {new Date(activeEvent.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">All Events</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-12">
              <AlertCircle className="mb-2 size-10 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No events created yet</p>
              <p className="mt-1 text-xs text-slate-500">Create your first event to get started</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#5CE1E6] px-4 py-2 text-sm font-medium text-[#0F172A] shadow-sm transition-colors hover:bg-[#5CE1E6]/90"
              >
                <Plus className="size-4" />
                Create Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    event.is_active
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {event.is_active ? (
                      <CheckCircle className="size-5 text-green-600" />
                    ) : (
                      <Circle className="size-5 text-slate-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">{event.event_name}</h3>
                      <p className="text-xs text-slate-600">
                        Created {new Date(event.created_at).toLocaleDateString()}
                      </p>
                      {event.start_date && event.end_date && (
                        <p className="text-xs text-slate-600">
                          {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEventToUpdate(event);
                        setUpdatedEventName(event.event_name);
                        setUpdatedIndustry(event.industry || ''); // NEW: Set industry for edit
                        setUpdatedStartDate(event.start_date ? new Date(event.start_date) : undefined);
                        setUpdatedEndDate(event.end_date ? new Date(event.end_date) : undefined);
                        setUpdatedLogoImage(event.logo_image || '');
                        setUpdatedBackgroundImage(event.background_image || '');
                        setLogoUrlInput('');
                        setBackgroundUrlInput('');
                      }}
                      className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition-colors hover:border-blue-600 hover:text-blue-600"
                      title="Edit event"
                    >
                      <Edit2 className="size-4" />
                    </button>

                    {event.is_active ? (
                      <button
                        onClick={() => handleToggleActive(event)}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-orange-500 text-white hover:bg-orange-600"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(event)}
                        className="px-4 py-2 rounded-lg font-medium text-sm bg-green-500 text-white hover:bg-green-600"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Dialog */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Event</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details for your new event. You can activate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <label htmlFor="event-name" className="block text-sm font-medium text-slate-700">
              Event Name
            </label>
            <input
              id="event-name"
              type="text"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="e.g., Tunisia Tech Summit 2026"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newEventName.trim()) {
                  handleCreateEvent();
                }
              }}
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="event-industry" className="block text-sm font-medium text-slate-700">
              Industry
            </label>
            <select
              id="event-industry"
              value={newEventIndustry}
              onChange={(e) => setNewEventIndustry(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select an industry</option>
              {INDUSTRY_SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label htmlFor="event-start-date" className="block text-sm font-medium text-slate-700">
              Start Date
            </label>
            <div className="mt-2">
              <DatePicker
                date={newEventStartDate}
                onDateChange={setNewEventStartDate}
                placeholder="Select start date"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="event-end-date" className="block text-sm font-medium text-slate-700">
              End Date
            </label>
            <div className="mt-2">
              <DatePicker
                date={newEventEndDate}
                onDateChange={setNewEventEndDate}
                placeholder="Select end date"
                minDate={newEventStartDate}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Logo Image
            </label>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewLogoInputMode('upload')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  newLogoInputMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setNewLogoInputMode('url')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  newLogoInputMode === 'url'
                    ? 'bg-[#5CE1E6] text-[#0F172A]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                URL
              </button>
            </div>

            <div className="flex items-start gap-3">
              {newLogoImage ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={newLogoImage}
                    alt="Logo preview"
                    className="w-20 h-20 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Logo';
                    }}
                  />
                  <button
                    onClick={() => {
                      setNewLogoImage('');
                      setNewLogoUrlInput('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
              )}

              <div className="flex-1">
                {newLogoInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      ref={newLogoInputRef}
                      onChange={handleNewLogoUpload}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      onClick={() => newLogoInputRef.current?.click()}
                      disabled={isUploadingNewLogo}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingNewLogo ? 'Uploading...' : 'Upload Logo'}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newLogoUrlInput}
                      onChange={(e) => setNewLogoUrlInput(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleApplyNewLogoUrl}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Background Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Background Image
            </label>

            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setNewBackgroundInputMode('upload')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  newBackgroundInputMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setNewBackgroundInputMode('url')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  newBackgroundInputMode === 'url'
                    ? 'bg-[#5CE1E6] text-[#0F172A]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                URL
              </button>
            </div>

            <div className="space-y-3">
              {newBackgroundImage ? (
                <div className="relative h-32 rounded-lg overflow-hidden border-2 border-slate-200">
                  <img
                    src={newBackgroundImage}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Background';
                    }}
                  />
                  <button
                    onClick={() => {
                      setNewBackgroundImage('');
                      setNewBackgroundUrlInput('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">No background</p>
                  </div>
                </div>
              )}

              <div>
                {newBackgroundInputMode === 'upload' ? (
                  <>
                    <input
                      type="file"
                      ref={newBackgroundInputRef}
                      onChange={handleNewBackgroundUpload}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      onClick={() => newBackgroundInputRef.current?.click()}
                      disabled={isUploadingNewBackground}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingNewBackground ? 'Uploading...' : 'Upload Background'}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newBackgroundUrlInput}
                      onChange={(e) => setNewBackgroundUrlInput(e.target.value)}
                      placeholder="https://example.com/background.jpg"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleApplyNewBackgroundUrl}
                      className="px-3 py-2 bg-[#5CE1E6] text-[#0F172A] rounded text-sm hover:bg-[#5CE1E6]/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCreateEvent();
              }}
              disabled={isCreating || !newEventName.trim() || !newEventStartDate || !newEventEndDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? 'Creating...' : 'Create Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Event Dialog */}
      <AlertDialog open={!!eventToUpdate} onOpenChange={() => {
        setEventToUpdate(null);
        setUpdatedLogoImage('');
        setUpdatedBackgroundImage('');
        setLogoUrlInput('');
        setBackgroundUrlInput('');
      }}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Event</AlertDialogTitle>
            <AlertDialogDescription>
              Update the event details, logo, and background image.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <label htmlFor="event-name" className="block text-sm font-medium text-slate-700">
                Event Name
              </label>
              <input
                id="event-name"
                type="text"
                value={updatedEventName}
                onChange={(e) => setUpdatedEventName(e.target.value)}
                placeholder="e.g., Tunisia Tech Summit 2026"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="event-industry" className="block text-sm font-medium text-slate-700">
                Industry
              </label>
              <select
                id="event-industry"
                value={updatedIndustry}
                onChange={(e) => setUpdatedIndustry(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an industry</option>
                {INDUSTRY_SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="event-start-date" className="block text-sm font-medium text-slate-700">
                Start Date
              </label>
              <div className="mt-2">
                <DatePicker
                  date={updatedStartDate}
                  onDateChange={setUpdatedStartDate}
                  placeholder="Select start date"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="event-end-date" className="block text-sm font-medium text-slate-700">
                End Date
              </label>
              <div className="mt-2">
                <DatePicker
                  date={updatedEndDate}
                  onDateChange={setUpdatedEndDate}
                  placeholder="Select end date"
                  minDate={updatedStartDate}
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Logo Image
              </label>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setLogoInputMode('upload')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    logoInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputMode('url')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    logoInputMode === 'url'
                      ? 'bg-[#5CE1E6] text-[#0F172A]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  URL
                </button>
              </div>

              <div className="flex items-start gap-3">
                {updatedLogoImage ? (
                  <div className="relative flex-shrink-0">
                    <img
                      src={updatedLogoImage}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Logo';
                      }}
                    />
                    <button
                      onClick={() => {
                        setUpdatedLogoImage('');
                        setLogoUrlInput('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                )}

                <div className="flex-1">
                  {logoInputMode === 'upload' ? (
                    <>
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
                        className="px-3 py-2 bg-[#5CE1E6] text-[#0F172A] rounded text-sm hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyLogoUrl}
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Background Image
              </label>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setBackgroundInputMode('upload')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    backgroundInputMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setBackgroundInputMode('url')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    backgroundInputMode === 'url'
                      ? 'bg-[#5CE1E6] text-[#0F172A]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  URL
                </button>
              </div>

              <div className="space-y-3">
                {updatedBackgroundImage ? (
                  <div className="relative h-32 rounded-lg overflow-hidden border-2 border-slate-200">
                    <img
                      src={updatedBackgroundImage}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Background';
                      }}
                    />
                    <button
                      onClick={() => {
                        setUpdatedBackgroundImage('');
                        setBackgroundUrlInput('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">No background</p>
                    </div>
                  </div>
                )}

                <div>
                  {backgroundInputMode === 'upload' ? (
                    <>
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
                        className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploadingBackground ? 'Uploading...' : 'Upload Background'}
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={backgroundUrlInput}
                        onChange={(e) => setBackgroundUrlInput(e.target.value)}
                        placeholder="https://example.com/background.jpg"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyBackgroundUrl}
                        className="px-3 py-2 bg-[#5CE1E6] text-[#0F172A] rounded text-sm hover:bg-[#5CE1E6]/90 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUpdateEvent();
              }}
              disabled={isUpdating || !updatedEventName.trim() || !updatedStartDate || !updatedEndDate}
              className="bg-[#5CE1E6] hover:bg-[#5CE1E6]/90 disabled:bg-[#5CE1E6]/50"
            >
              {isUpdating ? 'Updating...' : 'Update Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}