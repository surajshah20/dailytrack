import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div role="status" aria-label="Loading" className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};