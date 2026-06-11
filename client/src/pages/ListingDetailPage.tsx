import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, MessageSquare, Heart, Share2, ChevronLeft, ChevronRight,
  CheckCircle, BedDouble, Bath, Calendar, Users, Eye, Bookmark, AlertTriangle,
  Wifi, Wind, Car, UtensilsCrossed, Shield, Camera, Shirt, Droplets,
  BookOpen, Archive, Trees, Dumbbell, Bath as BathIcon, ExternalLink
} from 'lucide-react';
import { properties as propertiesApi, enquiries as enquiriesApi } from '../services/api';
import { TypeBadge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import type { Listing } from '../types';

const GENDER_LABEL: Record<string, string> = {
  male: 'Males only',
  female: 'Females only',
  mixed: 'Mixed',
  any: 'Any gender',
};

type LucideIcon = React.ElementType;

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  WiFi: Wifi,
  'Air Conditioning': Wind,
  Parking: Car,
  Kitchen: UtensilsCrossed,
  'Western Kitchen': UtensilsCrossed,
  'Shared Kitchen': UtensilsCrossed,
  'Common Kitchen': UtensilsCrossed,
  Security: Shield,
  'Security Guard': Shield,
  CCTV: Camera,
  Laundry: Shirt,
  'Washing Machine': Shirt,
  'Water 24/7': Droplets,
  'Hot Water': Droplets,
  'Water Heater': Droplets,
  'Ceiling Fan': Wind,
  'Study Desk': BookOpen,
  Wardrobe: Archive,
  Balcony: Trees,
  'Private Garden': Trees,
  Meals: UtensilsCrossed,
  'Meals Optional': UtensilsCrossed,
  'Meals Available': UtensilsCrossed,
  'Common Room': Users,
  'Study Area': BookOpen,
  Gym: Dumbbell,
  'Gym Access': Dumbbell,
  'Attached Bathroom': BathIcon,
  'Shared Bathroom': BathIcon,
};

function mapUrls(latitude?: number, longitude?: number, googleMapUrl?: string) {
  if (latitude === undefined || longitude === undefined) return null;
  const query = `${latitude},${longitude}`;
  return {
    embed: `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`,
    open: googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  };
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedListings, toggleSave, isAuthenticated } = useApp();
  const [listing, setListing] = useState<Listing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [loadingListing, setLoadingListing] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoadingListing(true);
    setNotFound(false);
    setActiveImg(0);
    propertiesApi.get(id)
      .then(data => {
        setListing(data);
        return propertiesApi.list({ area: data.area, limit: 4 });
      })
      .then(res => setRelated(res.data.filter(l => l.id !== id).slice(0, 3)))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingListing(false));
  }, [id]);

  if (loadingListing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Listing not found</h2>
          <Link to="/browse" className="text-sm text-[#475569] hover:text-[#0F172A] underline">
            Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = savedListings.includes(listing.id);
  const locationMap = mapUrls(listing.latitude, listing.longitude, listing.googleMapUrl);

  const handleSave = () => {
    if (!isAuthenticated) { navigate('/auth?mode=login'); return; }
    toggleSave(listing.id);
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/auth?mode=login'); return; }
    setInquiryError('');
    try {
      await enquiriesApi.create({ propertyId: listing.id, message: inquiryMsg });
      setInquirySent(true);
      setTimeout(() => setInquiryOpen(false), 2000);
    } catch (err) {
      setInquiryError(err instanceof Error ? err.message : 'Failed to send inquiry');
    }
  };

  const prevImg = () => setActiveImg(i => (i - 1 + listing.images.length) % listing.images.length);
  const nextImg = () => setActiveImg(i => (i + 1) % listing.images.length);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm">
          <Link to="/" className="text-[#94A3B8] hover:text-[#475569] transition-colors">Home</Link>
          <span className="text-[#E5E7EB]">/</span>
          <Link to="/browse" className="text-[#94A3B8] hover:text-[#475569] transition-colors">Browse</Link>
          <span className="text-[#E5E7EB]">/</span>
          <Link to={`/browse?area=${listing.area}`} className="text-[#94A3B8] hover:text-[#475569] transition-colors">{listing.area}</Link>
          <span className="text-[#E5E7EB]">/</span>
          <span className="text-[#475569] truncate max-w-xs">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB]">
              <div className="relative" style={{ paddingBottom: '58%' }}>
                <img
                  src={
                    imgError[activeImg]
                      ? `https://picsum.photos/seed/fallback-${listing.id}-${activeImg}/800/600`
                      : listing.images[activeImg]
                  }
                  alt={listing.title}
                  onError={() => setImgError(prev => ({ ...prev, [activeImg]: true }))}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#0F172A]" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#0F172A]" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {listing.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === activeImg ? 'bg-white w-5' : 'bg-white/50 w-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <TypeBadge type={listing.type} size="md" />
                  {listing.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/90 text-green-700 border border-green-100 px-2.5 py-1 rounded-md">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                  {activeImg + 1} / {listing.images.length}
                </div>
              </div>

              {listing.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-[#F8FAFC]">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        i === activeImg ? 'border-[#0F172A]' : 'border-transparent hover:border-[#CBD5E1]'
                      }`}
                    >
                      <img
                        src={imgError[i] ? `https://picsum.photos/seed/thumb-${listing.id}-${i}/200/150` : img}
                        onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & meta */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-2xl font-bold text-[#0B1220] leading-snug flex-1">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleSave}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      isSaved
                        ? 'bg-red-50 border-red-100 text-red-500'
                        : 'border-[#E5E7EB] text-[#94A3B8] hover:border-[#CBD5E1] hover:text-[#475569]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-9 h-9 rounded-xl border border-[#E5E7EB] text-[#94A3B8] flex items-center justify-center hover:border-[#CBD5E1] hover:text-[#475569] transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#64748B] mb-5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {listing.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {listing.views} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" />
                  {listing.saves} saves
                </span>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8FAFC] rounded-xl mb-5">
                <DetailStat icon={BedDouble} label="Occupancy" value={
                  listing.occupancy === 'single' ? 'Single' : listing.occupancy === 'double' ? 'Double' : 'Triple'
                } />
                <DetailStat icon={Bath} label="Bathrooms" value={`${listing.bathrooms} bath`} />
                <DetailStat icon={Users} label="Gender" value={GENDER_LABEL[listing.gender]} />
                <DetailStat icon={Calendar} label="Available from" value={
                  new Date(listing.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                } />
              </div>

              {/* Nearby landmarks */}
              <div>
                <h3 className="text-xs font-semibold text-[#94A3B8] mb-3 uppercase tracking-widest">Nearby</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.nearbyLandmarks.map(lm => (
                    <span key={lm} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-full">
                      <MapPin className="w-3 h-3 text-[#94A3B8]" />
                      {lm}
                    </span>
                  ))}
                  {listing.distanceFromSLIIT && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] border border-[#E5E7EB] px-3 py-1.5 rounded-full">
                      {listing.distanceFromSLIIT} km from SLIIT
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#0B1220] mb-3">About this property</h2>
              <p className="text-[#475569] leading-relaxed text-sm whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Map location */}
            {locationMap && (
              <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0B1220]">Location</h2>
                    <p className="text-sm text-[#64748B] mt-1">{listing.address}</p>
                  </div>
                  <a
                    href={locationMap.open}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg px-3 py-2 hover:bg-[#F1F5F9] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  <iframe
                    title={`${listing.title} location`}
                    src={locationMap.embed}
                    className="w-full h-80"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#0B1220] mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map(am => {
                  const IconComponent = AMENITY_ICON_MAP[am];
                  return (
                    <div key={am} className="flex items-center gap-2.5 text-sm text-[#475569]">
                      <div className="w-7 h-7 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg flex items-center justify-center flex-shrink-0">
                        {IconComponent
                          ? <IconComponent className="w-3.5 h-3.5 text-[#475569]" />
                          : <CheckCircle className="w-3.5 h-3.5 text-[#475569]" />
                        }
                      </div>
                      <span>{am}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Related listings */}
            {related.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[#0B1220] mb-4">More in {listing.area}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map(l => (
                    <Link key={l.id} to={`/listing/${l.id}`} className="group">
                      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-all duration-200">
                        <div className="relative" style={{ paddingBottom: '60%' }}>
                          <img
                            src={l.images[0]}
                            alt={l.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <div className="text-base font-bold text-[#0F172A]">
                            Rs. {l.price.toLocaleString()}
                            <span className="text-xs font-normal text-[#94A3B8] ml-1">/mo</span>
                          </div>
                          <div className="text-xs text-[#475569] mt-1 line-clamp-2">{l.title}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky contact card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price & contact card */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-[#0B1220]">
                    Rs. {listing.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#94A3B8] ml-1">/{listing.priceUnit}</span>
                </div>

                {listing.verified && (
                  <div className="flex items-center gap-2 mb-4 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Verified listing
                  </div>
                )}

                <div className="space-y-2.5 mb-5">
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex items-center justify-center gap-2.5 w-full bg-[#0F172A] text-white font-semibold text-sm py-3 px-4 rounded-xl hover:bg-[#1e293b] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call {listing.contactName.split(' ')[0]}
                  </a>

                  {listing.contactWhatsApp && (
                    <a
                      href={`https://wa.me/94${listing.contactWhatsApp.replace(/^0/, '')}?text=Hi, I saw your listing on ApeBoardima: ${listing.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] text-white font-semibold text-sm py-3 px-4 rounded-xl hover:bg-[#1fb858] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="flex items-center justify-center gap-2.5 w-full border border-[#E5E7EB] text-[#475569] font-semibold text-sm py-3 px-4 rounded-xl hover:border-[#0F172A] hover:text-[#0F172A] transition-all"
                  >
                    Send inquiry
                  </button>
                </div>

                {/* Landlord info */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {listing.contactName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#0F172A]">{listing.contactName}</div>
                    <div className="text-xs text-[#94A3B8]">Property owner</div>
                  </div>
                  {listing.verified && (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Safety tip */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#94A3B8] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#475569] mb-1">Safety reminder</p>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Always visit the property before paying. Never transfer money without seeing the room in person.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry modal */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInquiryOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {inquirySent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-[#0F172A]">Inquiry sent</h3>
                <p className="text-sm text-[#64748B] mt-1">
                  {listing.contactName} will respond shortly.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-[#0F172A] text-lg mb-1">Send an inquiry</h3>
                <p className="text-sm text-[#64748B] mb-4">
                  To {listing.contactName} about &ldquo;{listing.title}&rdquo;
                </p>
                <form onSubmit={handleInquiry}>
                  <textarea
                    value={inquiryMsg}
                    onChange={e => setInquiryMsg(e.target.value)}
                    placeholder={`Hi ${listing.contactName.split(' ')[0]}, I'm interested in this room. Is it still available?`}
                    className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] resize-none h-28 mb-4 placeholder-[#CBD5E1]"
                    required
                  />
                  {inquiryError && (
                    <p className="text-xs text-red-600 mb-3">{inquiryError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setInquiryOpen(false)}
                      className="flex-1 text-sm font-medium border border-[#E5E7EB] text-[#475569] py-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 text-sm font-semibold bg-[#0F172A] text-white py-2.5 rounded-xl hover:bg-[#1e293b] transition-colors"
                    >
                      {isAuthenticated ? 'Send' : 'Sign in to send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center mx-auto mb-1.5">
        <Icon className="w-4 h-4 text-[#64748B]" />
      </div>
      <div className="text-xs text-[#94A3B8] mb-0.5">{label}</div>
      <div className="text-xs font-semibold text-[#0F172A]">{value}</div>
    </div>
  );
}
