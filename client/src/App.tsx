import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import ListingDetailPage from './pages/ListingDetailPage'
import AuthPage from './pages/AuthPage'
import LandlordDashboard from './pages/LandlordDashboard'
import TenantDashboard from './pages/TenantDashboard'
import CreateListingPage from './pages/CreateListingPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth page (no layout wrapper) */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Main app routes with header/footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
            <Route path="/dashboard/tenant" element={<TenantDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
