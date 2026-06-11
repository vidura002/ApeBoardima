import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Plus, Eye, Heart, MessageSquare, Settings, LogOut,
  TrendingUp, CheckCircle, Clock, AlertCircle, Pencil, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { properties as propertiesApi, enquiries as enquiriesApi, type Enquiry } from '../services/api';
import { TypeBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Listing } from '../types';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'listings', label: 'My Listings', icon: Home },
  { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function LandlordDashboard() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([propertiesApi.mine(), enquiriesApi.forLandlord()])
      .then(([listingsRes, enquiriesRes]) => {
        setMyListings(listingsRes.data);
        setMyEnquiries(enquiriesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await propertiesApi.delete(id);
      setMyListings(prev => prev.filter(l => l.id !== id));
    } catch { /* ignore */ }
  };

  const totalViews = myListings.reduce((s, l) => s + l.views, 0);
  const totalSaves = myListings.reduce((s, l) => s + l.saves, 0);
  const activeCount = myListings.filter(l => l.approved).length;
  const newEnquiryCount = myEnquiries.filter(e => e.status === 'new').length;

  if (!currentUser) {
    navigate('/auth?mode=login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[#E5E7EB]">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F172A] tracking-tight text-sm">ApeBoardima</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.id === 'inquiries' && newEnquiryCount > 0 && (
                  <span className="ml-auto bg-[#0F172A] text-white text-xs px-1.5 py-0.5 rounded-full leading-none">{newEnquiryCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#0F172A] truncate">{currentUser.name}</div>
              <div className="text-xs text-[#94A3B8]">Landlord</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-bold text-[#0B1220] text-lg leading-tight">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-[#94A3B8]">Good morning, {currentUser.name.split(' ')[0]}</p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate('/create-listing')}>
            <Plus className="w-4 h-4" />
            New listing
          </Button>
        </div>

        <div className="p-6 lg:p-8">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Active listings', value: activeCount, icon: Home },
                  { label: 'Total views', value: totalViews.toLocaleString(), icon: Eye },
                  { label: 'Total saves', value: totalSaves, icon: Heart },
                  { label: 'Pending inquiries', value: newEnquiryCount, icon: MessageSquare },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                      <div className="w-9 h-9 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4 text-[#475569]" />
                      </div>
                      <div className="text-2xl font-bold text-[#0B1220] leading-none">{stat.value}</div>
                      <div className="text-sm text-[#94A3B8] mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#F1F5F9]">
                  <h2 className="font-semibold text-[#0F172A] text-sm">Recent activity</h2>
                </div>
                <div className="divide-y divide-[#F8FAFC]">
                  {[
                    { icon: Eye, text: 'Your listing "Modern Single Room near SLIIT" got 12 new views', time: '2h ago' },
                    { icon: Heart, text: 'Someone saved "Spacious Room near Kaduwela"', time: '4h ago' },
                    { icon: MessageSquare, text: 'New inquiry for "Modern Boarding near Malabe"', time: '6h ago' },
                    { icon: CheckCircle, text: '"Modern Single Room near SLIIT" was verified', time: '1d ago' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-8 h-8 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-[#475569]" />
                        </div>
                        <p className="text-sm text-[#475569] flex-1">{item.text}</p>
                        <span className="text-xs text-[#94A3B8] flex-shrink-0">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick listings preview */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB]">
                <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
                  <h2 className="font-semibold text-[#0F172A] text-sm">Your listings</h2>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs text-[#64748B] font-medium hover:text-[#0F172A] transition-colors"
                  >
                    View all
                  </button>
                </div>
                <ListingsTable listings={myListings.slice(0, 3)} onDelete={handleDelete} />
              </div>
            </div>
          )}

          {/* Listings tab */}
          {activeTab === 'listings' && (
            <div className="space-y-5">
              <p className="text-sm text-[#64748B]">{myListings.length} listings total</p>
              <div className="bg-white rounded-2xl border border-[#E5E7EB]">
                <ListingsTable listings={myListings} onDelete={handleDelete} />
              </div>
            </div>
          )}

          {/* Inquiries tab */}
          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              {myEnquiries.length === 0 ? (
                <div className="text-center py-20 text-[#94A3B8]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-[#64748B]">No inquiries yet</p>
                </div>
              ) : myEnquiries.map(enq => (
                <div key={enq.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#475569] font-bold text-sm flex-shrink-0">
                        {enq.tenant?.name?.charAt(0) ?? '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#0F172A] text-sm">{enq.tenant?.name ?? 'Unknown'}</span>
                          {enq.status === 'new' && (
                            <span className="text-xs font-medium text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-xs text-[#94A3B8] mb-2">Re: {enq.property?.title ?? enq.propertyId}</p>
                        <p className="text-sm text-[#475569]">{enq.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-[#94A3B8]">
                        {new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      {enq.status === 'new' && (
                        <button
                          onClick={() => enquiriesApi.updateStatus(enq.id, 'CONTACTED').then(() =>
                            setMyEnquiries(prev => prev.map(e => e.id === enq.id ? { ...e, status: 'contacted' } : e))
                          )}
                          className="text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                        >
                          Mark contacted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="max-w-xl">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F8FAFC]">
                <div className="p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-4 text-sm">Profile information</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Full name', value: currentUser.name, type: 'text' },
                      { label: 'Email', value: currentUser.email, type: 'email' },
                      { label: 'Phone', value: currentUser.phone || '', type: 'tel' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="md" className="mt-5">
                    Save changes
                  </Button>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-[#0F172A] mb-1 text-sm">Danger zone</h3>
                  <p className="text-sm text-[#64748B] mb-4">These actions are irreversible.</p>
                  <Button variant="danger" size="md">Delete account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingsTable({
  listings,
  onDelete,
}: {
  listings: Listing[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F1F5F9]">
            {['Listing', 'Type', 'Price', 'Status', 'Views', 'Saves', ''].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F8FAFC]">
          {listings.map(listing => (
            <tr key={listing.id} className="hover:bg-[#F8FAFC] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Link
                      to={`/listing/${listing.id}`}
                      className="text-sm font-semibold text-[#0F172A] hover:text-[#475569] line-clamp-1 max-w-[200px] transition-colors"
                    >
                      {listing.title}
                    </Link>
                    <div className="text-xs text-[#94A3B8]">{listing.area}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <TypeBadge type={listing.type} />
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-[#0F172A] whitespace-nowrap">
                Rs. {listing.price.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                {listing.approved ? (
                  listing.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Active
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-[#475569]">{listing.views.toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-[#475569]">{listing.saves}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/edit-listing/${listing.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#475569] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(listing.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
