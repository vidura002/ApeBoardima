import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { properties as propertiesApi } from '../../services/api';
import ListingCard from '../listings/ListingCard';
import { ListingCardSkeleton } from '../ui/Skeleton';
import type { Listing } from '../../types';

export default function FeaturedListings() {
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesApi.list({ featured: true, limit: 6 })
      .then(res => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">
              Featured
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1220] leading-tight">
              Handpicked listings
            </h2>
            <p className="text-[#64748B] mt-2">
              Verified rooms loved by students and professionals
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:gap-3 transition-all group"
          >
            View all listings
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : featured.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
          }
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A] border border-[#0F172A] px-5 py-2.5 rounded-xl hover:bg-[#0F172A] hover:text-white transition-all"
          >
            View all listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
