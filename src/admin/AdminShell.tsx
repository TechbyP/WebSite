import { Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './dashboard/hooks/AuthContext';
import { ThemeProvider } from '../utils/context/theme-context';

export default function AdminShell() {
  return (
    <AuthProvider>
      <PrivateRoute>
        <ThemeProvider>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </ThemeProvider>
      </PrivateRoute>
    </AuthProvider>
  );
}