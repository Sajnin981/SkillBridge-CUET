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
      <Route index element={<AdminEntry />} />
      <Route element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verifications" element={<AdminVerificationsPage />} />
        <Route path="companies" element={<AdminCompaniesPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="messages" element={<AdminMessagingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="." replace />} />
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
