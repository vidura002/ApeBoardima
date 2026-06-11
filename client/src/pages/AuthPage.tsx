import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Eye, EyeOff, User, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { auth as authApi } from '../services/api';

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginWithGoogle, signup, isAuthenticated, currentUser } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login',
  );
  const [role, setRole] = useState<'tenant' | 'landlord'>(
    searchParams.get('role') === 'landlord' ? 'landlord' : 'tenant',
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(GOOGLE_CLIENT_ID);
  const [googleConfigLoaded, setGoogleConfigLoaded] = useState(Boolean(GOOGLE_CLIENT_ID));
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    authApi.googleConfig()
      .then(config => {
        if (!cancelled && config.clientId) setGoogleClientId(config.clientId);
      })
      .catch(() => {
        if (!cancelled) setGoogleClientId('');
      })
      .finally(() => {
        if (!cancelled) setGoogleConfigLoaded(true);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!googleClientId) return;

    const scriptId = 'google-identity-services';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let cancelled = false;
    const renderGoogleButton = () => {
      if (cancelled) return;
      if (!window.google || !googleButtonRef.current) {
        setTimeout(renderGoogleButton, 100);
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async response => {
          try {
            setGoogleLoading(true);
            setError('');
            if (!response.credential) throw new Error('Missing Google credential');
            await loginWithGoogle(response.credential, role);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed.');
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        width: 320,
      });
    };

    renderGoogleButton();
    return () => { cancelled = true; };
  }, [googleClientId, loginWithGoogle, mode, role]);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = currentUser?.role === 'admin'
        ? '/dashboard/admin'
        : currentUser?.role === 'landlord'
          ? '/dashboard/landlord'
          : '/dashboard/tenant';
      navigate(redirect);
    }
  }, [isAuthenticated, currentUser, navigate]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let ok: boolean;
      if (mode === 'login') {
        ok = await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        ok = await signup(form.name, form.email, form.password, role);
      }
      if (!ok) setError('Invalid credentials. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-[#0F172A]" />
          </div>
          <span className="font-bold text-white text-xl tracking-tight">ApeBoardima</span>
        </div>

        {/* Middle content */}
        <div className="relative">
          <blockquote className="text-white/80 text-2xl font-light leading-relaxed mb-8 italic">
            "Found my perfect room near SLIIT in just 2 days. The listings are accurate and
            the landlord was verified — completely stress-free."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Ashan W.</div>
              <div className="text-white/50 text-xs">IT Student, SLIIT Malabe</div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative flex gap-8">
          {[
            { n: '500+', l: 'Listings' },
            { n: '200+', l: 'Landlords' },
            { n: '2', l: 'Areas' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl font-bold text-white">{s.n}</div>
              <div className="text-white/50 text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F172A] text-lg">ApeBoardima</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Toggle */}
          <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-8">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-[#0F172A] shadow-soft' : 'text-[#64748B]'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-[#0F172A] shadow-soft' : 'text-[#64748B]'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0B1220]">
              {mode === 'login' ? 'Welcome back' : 'Join ApeBoardima'}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              {mode === 'login'
                ? 'Sign in to access your account'
                : 'Create your free account today'}
            </p>
          </div>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div className="flex gap-3 mb-6">
              {([
                { value: 'tenant', label: 'Tenant', sub: 'Student or professional', Icon: User },
                { value: 'landlord', label: 'Landlord', sub: 'Property owner', Icon: Building2 },
              ] as const).map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                    role === r.value
                      ? 'border-[#0F172A] bg-[#0F172A] text-white'
                      : 'border-[#E5E7EB] text-[#475569] hover:border-[#CBD5E1]'
                  }`}
                >
                  <r.Icon className="w-5 h-5" />
                  <span>{r.label}</span>
                  <span className={`text-xs font-normal ${role === r.value ? 'text-white/60' : 'text-[#94A3B8]'}`}>{r.sub}</span>
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="Ashan Wickramasinghe"
                  value={form.name}
                  onChange={update('name')}
                  className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all placeholder-[#CBD5E1]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">Email address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all placeholder-[#CBD5E1]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#475569]">Password</label>
                {mode === 'login' && (
                  <a href="#" className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 pr-11 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all placeholder-[#CBD5E1]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-xs text-[#94A3B8]">or</span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <div className="min-h-[44px]">
            {googleClientId ? (
              <div className="flex justify-center">
                <div ref={googleButtonRef} />
              </div>
            ) : (
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#94A3B8] opacity-80"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-base font-bold text-[#4285F4]">
                  G
                </span>
                Continue with Google
              </button>
            )}
          </div>
          {!googleClientId && googleConfigLoaded && (
            <p className="mt-2 text-center text-xs text-[#64748B]">
              Add GOOGLE_CLIENT_ID to server/.env, then restart the backend.
            </p>
          )}
          {!googleClientId && !googleConfigLoaded && (
            <p className="mt-2 text-center text-xs text-[#64748B]">Checking Google sign-in setup...</p>
          )}
          {googleLoading && (
            <p className="mt-2 text-center text-xs text-[#64748B]">Connecting to Google...</p>
          )}

          {/* Switch mode */}
          <p className="text-sm text-center text-[#64748B]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="font-semibold text-[#0F172A] hover:underline"
            >
              {mode === 'login' ? 'Sign up for free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
