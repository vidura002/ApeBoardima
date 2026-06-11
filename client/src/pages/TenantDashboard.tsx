import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Heart, MessageSquare, Settings, LogOut, Search, MapPin, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { saved as savedApi, enquiries as enquiriesApi, type Enquiry } from '../services/api';
import { TypeBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Listing } from '../types';

const NAV_ITEMS = [
  { id: 'saved', label: 'Saved Rooms', icon: Heart },
  { id: 'inquiries', label: 'My Inquiries', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function TenantDashboard() {
  const { currentUser, savedListings, toggleSave, logout } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedListingsFull, setSavedListingsFull] = useState<Listing[]>([]);
  const [myEnquiries, setMyEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([savedApi.list(), enquiriesApi.forTenant()])
      .then(([savedRes, enquiriesRes]) => {
        setSavedListingsFull(savedRes.data);
        setMyEnquiries(enquiriesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser]);

  // Keep list in sync when user unsaves from this page
  useEffect(() => {
    setSavedListingsFull(prev => prev.filter(l => savedListings.includes(l.id)));
  }, [savedListings]);

  if (!currentUser) {
    navigate('/auth?mode=login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[#E5E7EB]">
          <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#0F172A] tracking-tight">ApeBoardima</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            to="/browse"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-all"
          >
            <Search className="w-4 h-4" />
            Browse rooms
          </Link>
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
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === 'saved' && savedListingsFull.length > 0 && (
                  <span className="ml-auto bg-[#0F172A] text-white text-xs px-1.5 py-0.5 rounded-full leading-none">{savedListingsFull.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#0F172A] truncate">{currentUser.name}</div>
              <div className="text-xs text-[#94A3B8]">Tenant</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 sticky top-0 z-10">
          <h1 className="font-bold text-[#0B1220] text-lg">
            {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <p className="text-sm text-[#94A3B8]">Welcome back, {currentUser.name.split(' ')[0]}</p>
        </div>

        <div className="p-6 lg:p-8">
          {/* Saved tab */}
          {activeTab === 'saved' && (
            <>
              {savedListingsFull.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-[#CBD5E1]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No saved rooms yet</h3>
                  <p className="text-sm text-[#64748B] mb-5">
                    Tap the heart on any listing to save it here.
                  </p>
                  <Button variant="primary" onClick={() => navigate('/browse')}>
                    Browse rooms
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {savedListingsFull.map(listing => (
                    <div key={listing.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-card">
                      <div className="relative" style={{ paddingBottom: '60%' }}>
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <TypeBadge type={listing.type} />
                        </div>
                        <button
                          onClick={() => toggleSave(listing.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="text-lg font-bold text-[#0F172A] mb-1">
                          Rs. {listing.price.toLocaleString()}
                          <span className="text-xs font-normal text-[#94A3B8] ml-1">/{listing.priceUnit}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#0B1220] mb-2 line-clamp-2">{listing.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          {listing.area}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/listing/${listing.id}`}
                            className="flex-1 text-xs font-semibold text-center bg-[#0F172A] text-white py-2 rounded-lg hover:bg-[#1e293b] transition-colors"
                          >
                            View listing
                          </Link>
                          <a
                            href={`tel:${listing.contactPhone}`}
                            className="flex-1 text-xs font-semibold text-center border border-[#E5E7EB] text-[#475569] py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                          >
                            Call landlord
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Inquiries tab */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {myEnquiries.length === 0 ? (
                <div className="text-center py-20 text-[#94A3B8]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-[#64748B]">No inquiries sent yet</p>
                </div>
              ) : myEnquiries.map(enq => (
                <div key={enq.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{enq.property?.title ?? enq.propertyId}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(enq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {enq.status === 'contacted' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Contacted
                      </span>
                    ) : enq.status === 'closed' ? (
                      <span className="text-xs font-medium text-[#94A3B8] bg-[#F1F5F9] px-2.5 py-1 rounded-full flex-shrink-0">
                        Closed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 rounded-full flex-shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 text-sm text-[#475569]">
                    <p className="text-xs text-[#94A3B8] mb-1">Your message:</p>
                    {enq.message}
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
                  <h3 className="font-semibold text-[#0F172A] mb-4">Profile information</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Full name', value: currentUser.name, type: 'text' },
                      { label: 'Email', value: currentUser.email, type: 'email' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-1.5">{field.label}</label>
                        <input
                          type={field.type}
                          defaultValue={field.value}
                          className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]"
                        />
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="md" className="mt-5">
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
