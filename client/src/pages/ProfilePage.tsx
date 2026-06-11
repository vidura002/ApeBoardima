import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BadgeCheck, CalendarDays, LayoutDashboard, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';

function formatDate(value?: string) {
  if (!value) return 'Not available';

  return new Intl.DateTimeFormat('en-LK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export default function ProfilePage() {
  const { currentUser, isAuthenticated, authLoading, updateProfile } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
  }, [currentUser]);

  const dashboardPath = currentUser?.role === 'admin'
    ? '/dashboard/admin'
    : currentUser?.role === 'landlord'
      ? '/dashboard/landlord'
      : '/dashboard/tenant';
  const initials = useMemo(() => {
    return currentUser?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }, [currentUser?.name]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-sm font-medium text-[#475569]">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-[#64748B]">Account</p>
            <h1 className="text-3xl font-bold text-[#0F172A] mt-1">My Profile</h1>
          </div>
          <Link
            to={dashboardPath}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#0F172A] bg-white border border-[#E5E7EB] rounded-lg px-4 py-2 hover:bg-[#F8FAFC] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-[#E5E7EB] rounded-2xl p-6 h-fit">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-[#0F172A] truncate">{currentUser.name}</h2>
                <p className="text-sm text-[#64748B] capitalize">{currentUser.role}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-[#475569]">
                <Mail className="w-4 h-4 text-[#94A3B8]" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                <Phone className="w-4 h-4 text-[#94A3B8]" />
                <span>{currentUser.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                <CalendarDays className="w-4 h-4 text-[#94A3B8]" />
                <span>Joined {formatDate(currentUser.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475569]">
                {currentUser.verified ? (
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#94A3B8]" />
                )}
                <span>{currentUser.verified ? 'Verified account' : 'Verification pending'}</span>
              </div>
            </div>
          </aside>

          <section className="bg-white border border-[#E5E7EB] rounded-2xl">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0F172A]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0F172A]">Profile information</h2>
                  <p className="text-sm text-[#64748B]">Keep your contact details current.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={event => setPhone(event.target.value)}
                    className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full text-sm text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              {(error || success) && (
                <div className={`mt-5 text-sm ${error ? 'text-red-600' : 'text-emerald-700'}`}>
                  {error || success}
                </div>
              )}

              <div className="mt-6">
                <Button type="submit" variant="primary" size="md" loading={saving}>
                  <Save className="w-4 h-4" />
                  Save changes
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
