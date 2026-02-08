import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCurrentEvent, fetchAllEvents } from '../../lib/api';

interface EventContextType {
  eventName: string;
  eventId: string | null;
  backgroundImage: string;
  logoImage: string | null;
  eventHistory: Array<{ eventName: string; changedAt: string; id: string }>;
  updateEventName: (name: string) => void;
  updateBackgroundImage: (url: string) => void;
  reloadEvent: () => Promise<void>;
  isLoading: boolean;
  hasActiveEvent: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [eventName, setEventName] = useState('Tunisia Tech Summit 2026');
  const [eventId, setEventId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80'
  );
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<
    Array<{ eventName: string; changedAt: string; id: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveEvent, setHasActiveEvent] = useState(false);

  useEffect(() => {
    loadEventData();
  }, []);

  const loadEventData = async () => {
    try {
      setIsLoading(true);

      // Fetch current event
      console.log('🔍 [EventContext] Fetching current event...');
      const currentEvent = await fetchCurrentEvent();
      console.log('✅ [EventContext] Current event data:', currentEvent);
      
      if (currentEvent) {
        setEventName(currentEvent.event_name);
        setEventId(currentEvent.id);
        setBackgroundImage(
          currentEvent.background_image ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80'
        );
        setLogoImage(currentEvent.logo_image);
        setHasActiveEvent(true);
      } else {
        console.warn('⚠️ [EventContext] No active event found');
        setHasActiveEvent(false);
      }

      // Fetch all events for history
      const allEvents = await fetchAllEvents();
      setEventHistory(
        allEvents.map((event: any) => ({
          eventName: event.event_name,
          changedAt: event.created_at,
          id: event.id,
        }))
      );
    } catch (error) {
      console.error('Error loading event data:', error);
      // Use default values on error
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventName = (name: string) => {
    setEventName(name);
  };

  const updateBackgroundImage = (url: string) => {
    setBackgroundImage(url);
  };

  const reloadEvent = async () => {
    await loadEventData();
  };

  return (
    <EventContext.Provider
      value={{
        eventName,
        eventId,
        backgroundImage,
        logoImage,
        eventHistory,
        updateEventName,
        updateBackgroundImage,
        reloadEvent,
        isLoading,
        hasActiveEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    console.error('[useEvent] Context is undefined! EventProvider may not be wrapping this component.');
    console.trace();
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}