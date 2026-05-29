import Login from './dashboard/Login';
import { AuthProvider } from './dashboard/hooks/AuthContext';

export default function AdminLoginRoute() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
}