import { Outlet } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { EventProvider } from '../context/EventContext';
import { LanguageProvider } from '../context/LanguageContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './ErrorBoundary';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <EventProvider>
          <LanguageProvider>
            <Outlet />
            <Toaster position="top-right" richColors />
          </LanguageProvider>
        </EventProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}