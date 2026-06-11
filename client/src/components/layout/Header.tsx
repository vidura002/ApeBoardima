import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Home, Search, LogOut, User, LayoutDashboard, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';

export default function Header() {
  const { currentUser, isAuthenticated, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const dashboardPath = currentUser?.role === 'admin'
    ? '/dashboard/admin'
    : currentUser?.role === 'landlord'
      ? '/dashboard/landlord'
      : '/dashboard/tenant';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0F172A] text-lg tracking-tight">ApeBoardima</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'bg-[#F8FAFC] text-[#0F172A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Rooms
            </Link>
            <a
              href="#how-it-works"
              onClick={e => {
                e.preventDefault();
                if (location.pathname !== '/') navigate('/');
                setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              How it works
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {currentUser?.role === 'landlord' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/create-listing')}
                  >
                    <Plus className="w-4 h-4" />
                    Post a Room
                  </Button>
                )}
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E5E7EB] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all text-sm font-medium text-[#0F172A]"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-xs font-semibold">
                      {currentUser?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{currentUser?.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-[#E5E7EB] overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-[#F1F5F9]">
                          <p className="text-sm font-semibold text-[#0F172A] truncate">{currentUser?.name}</p>
                          <p className="text-xs text-[#94A3B8] truncate">{currentUser?.email}</p>
                        </div>
                        <nav className="p-1.5">
                          <Link
                            to={dashboardPath}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                          >
                            <User className="w-4 h-4" />
                            My Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors mt-0.5"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth?mode=login')}>
                  Sign in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/auth?mode=signup')}>
                  Get started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#F8FAFC]"
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/browse"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <Search className="w-4 h-4" />
              Browse Rooms
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                {currentUser?.role === 'landlord' && (
                  <Link
                    to="/create-listing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <Plus className="w-4 h-4" />
                    Post a Room
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 pb-1">
                <Button variant="secondary" fullWidth onClick={() => { navigate('/auth?mode=login'); setMenuOpen(false); }}>
                  Sign in
                </Button>
                <Button variant="primary" fullWidth onClick={() => { navigate('/auth?mode=signup'); setMenuOpen(false); }}>
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
