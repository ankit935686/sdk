import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, hasToken } = useAuth()
  const location = useLocation()

  if (!user && !hasToken) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
