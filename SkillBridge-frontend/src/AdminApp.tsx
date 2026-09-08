import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCompaniesPage from '@/pages/admin/AdminCompaniesPage';
import AdminVerificationsPage from '@/pages/admin/AdminVerificationsPage';
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminSearchPage from '@/pages/admin/AdminSearchPage';

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="search" element={<AdminSearchPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
