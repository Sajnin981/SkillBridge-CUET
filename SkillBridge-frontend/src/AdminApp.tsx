import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCompaniesPage from '@/pages/admin/AdminCompaniesPage';
import AdminVerificationsPage from '@/pages/admin/AdminVerificationsPage';
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage';
import AdminMessagingPage from '@/pages/admin/AdminMessagingPage';

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminEntry />} />
      <Route element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/messages" element={<AdminMessagingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function AdminEntry() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-ink-50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>;
  }

  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return <AdminLoginPage />;
}
