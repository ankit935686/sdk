import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CleverTapInspector } from './components/analytics/CleverTapInspector'
import { AuthProvider } from './hooks/AuthProvider'
import { CartProvider } from './hooks/CartContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { ProtectedRoute } from './pages/ProtectedRoute'
import { RestaurantPage } from './pages/RestaurantPage'
import { initCleverTap } from './services/clevertap'

function App() {
  useEffect(() => {
    initCleverTap()
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* CleverTap Realtime Learning & Debugging Hub */}
          <CleverTapInspector />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

