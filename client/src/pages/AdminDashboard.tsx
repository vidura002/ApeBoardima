import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  AlertCircle, BadgeCheck, CheckCircle, Home, Mail, Search, ShieldCheck,
  Sparkles, Trash2, UserCheck, Users, XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  adminUsers, properties as propertiesApi,
  type AdminListingStatus, type AdminUser,
} from '../services/api';
import { Badge, TypeBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Listing, UserRole } from '../types';

const POST_FILTERS: { id: AdminListingStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'verified', label: 'Verified' },
];

const USER_FILTERS: { id: UserRole | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tenant', label: 'Tenants' },
  { id: 'landlord', label: 'Landlords' },
  { id: 'admin', label: 'Admins' },
];

function statusFor(listing: Listing) {
  if (!listing.approved) return { label: 'Pending', variant: 'warning' as const, Icon: AlertCircle };
  if (listing.verified) return { label: 'Verified', variant: 'success' as const, Icon: BadgeCheck };
  return { label: 'Approved', variant: 'default' as const, Icon: CheckCircle };
}

function roleBadge(role: UserRole) {
  if (role === 'admin') return 'error';
  if (role === 'landlord') return 'warning';
  return 'default';
}

export default function AdminDashboard() {
  const { currentUser, isAuthenticated, authLoading } = useApp();
  const [tab, setTab] = useState<'posts' | 'users'>('posts');
  const [postFilter, setPostFilter] = useState<AdminListingStatus>('all');
  const [userFilter, setUserFilter] = useState<UserRole | 'all'>('all');
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    setLoadingPosts(true);
    setError('');
    propertiesApi.adminList(postFilter)
      .then(({ data }) => setListings(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load posts.'))
      .finally(() => setLoadingPosts(false));
  }, [currentUser?.role, postFilter]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    setLoadingUsers(true);
    setError('');
    adminUsers.list()
      .then(({ data }) => setUsers(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load users.'))
      .finally(() => setLoadingUsers(false));
  }, [currentUser?.role]);

  const filteredListings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return listings;
    return listings.filter(listing =>
      [listing.title, listing.area, listing.address, listing.contactName, listing.contactPhone]
        .some(value => value.toLowerCase().includes(needle))
    );
  }, [listings, query]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter(user => {
      const matchesRole = userFilter === 'all' || user.role === userFilter;
      const matchesQuery = !needle || [user.name, user.email, user.phone || '', user.role]
        .some(value => value.toLowerCase().includes(needle));
      return matchesRole && matchesQuery;
    });
  }, [users, userFilter, query]);

  const postStats = useMemo(() => ({
    total: listings.length,
    pending: listings.filter(listing => !listing.approved).length,
    approved: listings.filter(listing => listing.approved).length,
    verified: listings.filter(listing => listing.verified).length,
  }), [listings]);

  const userStats = useMemo(() => ({
    total: users.length,
    tenants: users.filter(user => user.role === 'tenant').length,
    landlords: users.filter(user => user.role === 'landlord').length,
    verified: users.filter(user => user.verified).length,
  }), [users]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-sm font-medium text-[#475569]">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth?mode=login" replace />;
  if (currentUser?.role !== 'admin') return <Navigate to="/" replace />;

  const updateListing = async (id: string, data: { approved?: boolean; verified?: boolean; featured?: boolean }) => {
    try {
      setBusyId(id);
      setError('');
      const updated = await propertiesApi.moderate(id, data);
      setListings(prev => prev.map(listing => listing.id === id ? updated : listing));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update post.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      setBusyId(id);
      setError('');
      await propertiesApi.delete(id);
      setListings(prev => prev.filter(listing => listing.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete post.');
    } finally {
      setBusyId(null);
    }
  };

  const updateUser = async (id: string, data: { role?: UserRole; verified?: boolean }) => {
    try {
      setBusyId(id);
      setError('');
      const { user } = await adminUsers.update(id, data);
      setUsers(prev => prev.map(item => item.id === id ? user : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all related data?')) return;
    try {
      setBusyId(id);
      setError('');
      await adminUsers.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete user.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <p className="text-sm font-medium text-[#64748B]">Administration</p>
            <h1 className="text-3xl font-bold text-[#0F172A] mt-1">Admin Dashboard</h1>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={tab === 'posts' ? 'Search posts' : 'Search users'}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'posts', label: 'Post management', Icon: Home },
            { id: 'users', label: 'User management', Icon: Users },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id as 'posts' | 'users'); setError(''); }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === item.id
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-white text-[#475569] border border-[#E5E7EB] hover:text-[#0F172A]'
              }`}
            >
              <item.Icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'posts' ? (
          <>
            <StatsGrid
              stats={[
                { label: 'Total posts', value: postStats.total, Icon: Home },
                { label: 'Pending', value: postStats.pending, Icon: AlertCircle },
                { label: 'Approved', value: postStats.approved, Icon: CheckCircle },
                { label: 'Verified', value: postStats.verified, Icon: BadgeCheck },
              ]}
            />
            <PostManagement
              listings={filteredListings}
              filter={postFilter}
              loading={loadingPosts}
              error={error}
              busyId={busyId}
              onFilterChange={setPostFilter}
              onModerate={updateListing}
              onDelete={deleteListing}
            />
          </>
        ) : (
          <>
            <StatsGrid
              stats={[
                { label: 'Total users', value: userStats.total, Icon: Users },
                { label: 'Tenants', value: userStats.tenants, Icon: UserCheck },
                { label: 'Landlords', value: userStats.landlords, Icon: Home },
                { label: 'Verified users', value: userStats.verified, Icon: BadgeCheck },
              ]}
            />
            <UserManagement
              users={filteredUsers}
              currentUserId={currentUser.id}
              filter={userFilter}
              loading={loadingUsers}
              error={error}
              busyId={busyId}
              onFilterChange={setUserFilter}
              onUpdate={updateUser}
              onDelete={deleteUser}
            />
          </>
        )}
      </main>
    </div>
  );
}

function StatsGrid({
  stats,
}: {
  stats: { label: string; value: number; Icon: ElementType }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
          <div className="w-9 h-9 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center mb-3">
            <stat.Icon className="w-4 h-4 text-[#475569]" />
          </div>
          <div className="text-2xl font-bold text-[#0F172A] leading-none">{stat.value}</div>
          <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function PostManagement({
  listings,
  filter,
  loading,
  error,
  busyId,
  onFilterChange,
  onModerate,
  onDelete,
}: {
  listings: Listing[];
  filter: AdminListingStatus;
  loading: boolean;
  error: string;
  busyId: string | null;
  onFilterChange: (filter: AdminListingStatus) => void;
  onModerate: (id: string, data: { approved?: boolean; verified?: boolean; featured?: boolean }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {POST_FILTERS.map(item => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={`text-sm font-semibold rounded-lg px-3 py-2 transition-colors ${
                filter === item.id
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-[#64748B]">Loading posts...</div>
      ) : listings.length === 0 ? (
        <EmptyState icon={ShieldCheck} text="No posts found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['Post', 'Type', 'Contact', 'Status', 'Created', 'Actions'].map(head => (
                  <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {listings.map(listing => {
                const status = statusFor(listing);
                const isBusy = busyId === listing.id;

                return (
                  <tr key={listing.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-xl overflow-hidden bg-[#F1F5F9] flex-shrink-0">
                          {listing.images[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/listing/${listing.id}`} className="text-sm font-semibold text-[#0F172A] hover:text-[#475569] line-clamp-1">
                            {listing.title}
                          </Link>
                          <p className="text-xs text-[#94A3B8] line-clamp-1">{listing.area} · {listing.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={listing.type} />
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <p className="text-sm font-medium text-[#0F172A]">{listing.contactName}</p>
                      <p className="text-xs text-[#94A3B8]">{listing.contactPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant}>
                        <span className="inline-flex items-center gap-1">
                          <status.Icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </Badge>
                      {listing.featured && (
                        <div className="mt-1">
                          <Badge variant="outline">Featured</Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] whitespace-nowrap">
                      {new Date(listing.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 min-w-[360px]">
                        {!listing.approved ? (
                          <Button variant="primary" size="sm" disabled={isBusy} onClick={() => onModerate(listing.id, { approved: true })}>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" disabled={isBusy} onClick={() => onModerate(listing.id, { approved: false })}>
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isBusy || !listing.approved}
                          onClick={() => onModerate(listing.id, { verified: !listing.verified })}
                        >
                          <BadgeCheck className="w-4 h-4" />
                          {listing.verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isBusy || !listing.approved}
                          onClick={() => onModerate(listing.id, { featured: !listing.featured })}
                        >
                          <Sparkles className="w-4 h-4" />
                          {listing.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button variant="danger" size="sm" disabled={isBusy} onClick={() => onDelete(listing.id)}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserManagement({
  users,
  currentUserId,
  filter,
  loading,
  error,
  busyId,
  onFilterChange,
  onUpdate,
  onDelete,
}: {
  users: AdminUser[];
  currentUserId: string;
  filter: UserRole | 'all';
  loading: boolean;
  error: string;
  busyId: string | null;
  onFilterChange: (filter: UserRole | 'all') => void;
  onUpdate: (id: string, data: { role?: UserRole; verified?: boolean }) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-[#F1F5F9] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {USER_FILTERS.map(item => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id)}
              className={`text-sm font-semibold rounded-lg px-3 py-2 transition-colors ${
                filter === item.id
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm font-medium text-[#64748B]">Loading users...</div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} text="No users found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['User', 'Role', 'Status', 'Activity', 'Joined', 'Actions'].map(head => (
                  <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8FAFC]">
              {users.map(user => {
                const isBusy = busyId === user.id;
                const isSelf = currentUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A] truncate">{user.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-[#94A3B8] truncate">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleBadge(user.role) as 'default' | 'warning' | 'error'}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.verified ? (
                        <Badge variant="success">
                          <span className="inline-flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                          </span>
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unverified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] whitespace-nowrap">
                      {user.listingCount} posts · {user.enquiryCount} inquiries · {user.savedCount} saved
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 min-w-[430px]">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => onUpdate(user.id, { verified: !user.verified })}
                        >
                          <BadgeCheck className="w-4 h-4" />
                          {user.verified ? 'Unverify' : 'Verify'}
                        </Button>
                        <select
                          value={user.role}
                          disabled={isBusy || isSelf}
                          onChange={event => onUpdate(user.id, { role: event.target.value as UserRole })}
                          className="text-sm font-semibold text-[#0F172A] bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0F172A]"
                        >
                          <option value="tenant">Tenant</option>
                          <option value="landlord">Landlord</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isBusy || isSelf}
                          onClick={() => onDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: ElementType; text: string }) {
  return (
    <div className="py-20 text-center">
      <Icon className="w-10 h-10 mx-auto mb-3 text-[#CBD5E1]" />
      <p className="text-sm font-medium text-[#64748B]">{text}</p>
    </div>
  );
}
