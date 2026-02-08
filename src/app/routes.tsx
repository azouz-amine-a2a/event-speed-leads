import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { StaffContactForm } from './pages/StaffContactForm';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { OwnerOverview } from './pages/owner/OwnerOverview';
import { WorkersManagement } from './pages/owner/WorkersManagement';
import { Analytics } from './pages/owner/Analytics';
import { DataExport } from './pages/owner/DataExport';
import { OwnerProfile } from './pages/owner/OwnerProfile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AccountOwnersManagement } from './pages/admin/AccountOwnersManagement';
import { SystemOverview } from './pages/admin/SystemOverview';
import { SuperAdminDataExport } from './pages/admin/SuperAdminDataExport';
import { EventManagement } from './pages/admin/EventManagement';
import { AdminProfile } from './pages/admin/AdminProfile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootLayout } from './components/RootLayout';

export function createRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <LoginPage />,
        },
        {
          path: 'staff',
          element: (
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffContactForm />
            </ProtectedRoute>
          ),
        },
        {
          path: 'owner',
          element: (
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Navigate to="/owner/overview" replace />,
            },
            {
              path: 'overview',
              element: <OwnerOverview />,
            },
            {
              path: 'workers',
              element: <WorkersManagement />,
            },
            {
              path: 'analytics',
              element: <Analytics />,
            },
            {
              path: 'export',
              element: <DataExport />,
            },
            {
              path: 'profile',
              element: <OwnerProfile />,
            },
          ],
        },
        {
          path: 'admin',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Navigate to="/admin/overview" replace />,
            },
            {
              path: 'accounts',
              element: <AccountOwnersManagement />,
            },
            {
              path: 'overview',
              element: <SystemOverview />,
            },
            {
              path: 'data-export',
              element: <SuperAdminDataExport />,
            },
            {
              path: 'event-management',
              element: <EventManagement />,
            },
            {
              path: 'profile',
              element: <AdminProfile />,
            },
          ],
        },
        {
          path: '*',
          element: <Navigate to="/" replace />,
        },
      ],
    },
  ]);
}

export const router = createRouter();