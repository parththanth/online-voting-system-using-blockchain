
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = authService.isAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;
