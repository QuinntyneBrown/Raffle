import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/shared-ui/ToastContext';
import { DrawPage } from '@/public-app/pages/DrawPage';
import { QRCodePage } from '@/public-app/pages/QRCodePage';
import { EntryPage } from '@/public-app/pages/EntryPage';
import { LoginPage } from '@/admin-app/pages/LoginPage';
import { DashboardPage } from '@/admin-app/pages/DashboardPage';
import { CreateRafflePage } from '@/admin-app/pages/CreateRafflePage';
import { EditRafflePage } from '@/admin-app/pages/EditRafflePage';
import { RaffleDetailPage } from '@/admin-app/pages/RaffleDetailPage';
import { SettingsPage } from '@/admin-app/pages/SettingsPage';
import { AdminLayout } from '@/admin-app/components/AdminLayout';
import { ProtectedRoute } from '@/admin-app/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<DrawPage />} />
          <Route path="/qr" element={<QRCodePage />} />
          <Route path="/enter" element={<EntryPage />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="create" element={<CreateRafflePage />} />
            <Route path="raffles/:id" element={<RaffleDetailPage />} />
            <Route path="raffles/:id/edit" element={<EditRafflePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
