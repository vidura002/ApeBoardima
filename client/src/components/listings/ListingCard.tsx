import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, CheckCircle, Wifi, Eye, BedDouble } from 'lucide-react';
import type { Listing } from '../../types';
import { TypeBadge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import AuthRequiredModal from '../auth/AuthRequiredModal';

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
}

const GENDER_LABEL: Record<string, string> = {
  male: 'Males only',
  female: 'Females only',
  mixed: 'Mixed',
  any: 'Any gender',
};

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { savedListings, toggleSave, isAuthenticated } = useApp();
  const isSaved = savedListings.includes(listing.id);
  const [imgError, setImgError] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authPromptCopy, setAuthPromptCopy] = useState({
    title: 'Sign in to view listing details',
    message: 'Create a free account or sign in to see full room details, photos, map location, and landlord contact options.',
  });

  const handleOpenListing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return;
    e.preventDefault();
    setAuthPromptCopy({
      title: 'Sign in to view listing details',
      message: 'Create a free account or sign in to see full room details, photos, map location, and landlord contact options.',
    });
    setAuthPromptOpen(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthPromptCopy({
        title: 'Sign in to save this room',
        message: 'Create a free account or sign in to keep this listing in your saved rooms.',
      });
      setAuthPromptOpen(true);
      return;
    }
    toggleSave(listing.id);
  };

  const primaryImage = listing.images[0];

  return (
    <>
      <Link to={`/listing/${listing.id}`} onClick={handleOpenListing} className="group block">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#F8FAFC]" style={{ paddingBottom: compact ? '62%' : '66%' }}>
          <img
            src={imgError ? `https://picsum.photos/seed/fallback-${listing.id}/800/600` : primaryImage}
            alt={listing.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <TypeBadge type={listing.type} />
            {listing.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            title={isSaved ? 'Unsave' : 'Save'}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-red-500 text-red-500' : 'text-[#94A3B8]'
              }`}
            />
          </button>

          {/* Distance pill */}
          {listing.distanceFromSLIIT && (
            <div className="absolute bottom-3 left-3 bg-[#0F172A]/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {listing.distanceFromSLIIT} km from SLIIT
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl font-bold text-[#0F172A]">
                Rs. {listing.price.toLocaleString()}
              </span>
              <span className="text-sm text-[#94A3B8] font-normal ml-1">/{listing.priceUnit}</span>
            </div>
            {!compact && (
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[#0B1220] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#14213D] transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[#94A3B8] text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{listing.area}</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="truncate max-w-[120px]">{listing.address.split(',')[0]}</span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded-lg">
              <BedDouble className="w-3 h-3" />
              {listing.occupancy === 'single' ? 'Single' : listing.occupancy === 'double' ? 'Double' : 'Triple'}
            </span>
            {listing.amenities.includes('WiFi') && (
              <span className="inline-flex items-center gap-1 text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-1 rounded-lg">
                <Wifi className="w-3 h-3" />
                WiFi
              </span>
            )}
            <span className="text-xs text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded-lg">
              {GENDER_LABEL[listing.gender]}
            </span>
          </div>
        </div>
      </div>
      </Link>
      <AuthRequiredModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title={authPromptCopy.title}
        message={authPromptCopy.message}
      />
    </>
  );
}
