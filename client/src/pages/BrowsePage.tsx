import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
import { properties as propertiesApi, type PropertyFilters } from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import FilterPanel from '../components/listings/FilterPanel';
import { ListingCardSkeleton } from '../components/ui/Skeleton';
import type { Listing, SearchFilters } from '../types';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  area: '',
  type: '',
  minPrice: '',
  maxPrice: '',
  gender: '',
  furnished: '',
  sortBy: 'newest',
};

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    area: searchParams.get('area') || '',
    type: (searchParams.get('type') as SearchFilters['type']) || '',
    query: searchParams.get('q') || '',
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchListings = useCallback(async (f: SearchFilters) => {
    setLoading(true);
    setError('');
    try {
      const params: PropertyFilters = {
        sortBy: f.sortBy,
        limit: 24,
      };
      if (f.query) params.q = f.query;
      if (f.area) params.area = f.area;
      if (f.type) params.type = f.type;
      if (f.minPrice !== '') params.minPrice = Number(f.minPrice);
      if (f.maxPrice !== '') params.maxPrice = Number(f.maxPrice);
      if (f.gender) params.gender = f.gender;
      if (f.furnished !== '') params.furnished = Boolean(f.furnished);

      const res = await propertiesApi.list(params);
      setListings(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce text search, immediate for other filters
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchListings(filters), filters.query ? 400 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, fetchListings]);

  const updateFilter = useCallback((partial: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.area !== '' || filters.type !== '' || filters.minPrice !== '' ||
    filters.maxPrice !== '' || filters.gender !== '' || filters.furnished !== '';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search listings, areas, landmarks..."
                value={filters.query}
                onChange={e => updateFilter({ query: e.target.value })}
                className="w-full pl-9 pr-9 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all"
              />
              {filters.query && (
                <button
                  onClick={() => updateFilter({ query: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className={`lg:hidden flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
                hasActiveFilters
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-[#475569] border-[#E5E7EB]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-[#64748B]">
                <span className="font-semibold text-[#0F172A]">{total}</span> listings
              </span>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#0F172A] text-white' : 'text-[#94A3B8] hover:bg-[#F8FAFC]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#0F172A] text-white' : 'text-[#94A3B8] hover:bg-[#F8FAFC]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {filters.area && <ActiveChip label={filters.area} onRemove={() => updateFilter({ area: '' })} />}
              {filters.type && <ActiveChip label={filters.type} onRemove={() => updateFilter({ type: '' })} />}
              {(filters.minPrice !== '' || filters.maxPrice !== '') && (
                <ActiveChip
                  label={
                    filters.minPrice !== '' && filters.maxPrice !== ''
                      ? `Rs. ${Number(filters.minPrice).toLocaleString()} – ${Number(filters.maxPrice).toLocaleString()}`
                      : filters.minPrice !== ''
                      ? `From Rs. ${Number(filters.minPrice).toLocaleString()}`
                      : `Up to Rs. ${Number(filters.maxPrice).toLocaleString()}`
                  }
                  onRemove={() => updateFilter({ minPrice: '', maxPrice: '' })}
                />
              )}
              {filters.gender && <ActiveChip label={filters.gender} onRemove={() => updateFilter({ gender: '' })} />}
              {filters.furnished !== '' && (
                <ActiveChip label={filters.furnished ? 'Furnished' : 'Unfurnished'} onRemove={() => updateFilter({ furnished: '' })} />
              )}
              <button onClick={resetFilters} className="text-xs text-[#475569] font-medium hover:underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel
              filters={filters}
              onChange={updateFilter}
              onReset={resetFilters}
              resultCount={total}
            />
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 inset-y-0 w-80 bg-white overflow-y-auto">
                <FilterPanel
                  filters={filters}
                  onChange={updateFilter}
                  onReset={resetFilters}
                  resultCount={total}
                  mobileOpen={true}
                  onMobileClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState message={error} onRetry={() => fetchListings(filters)} />
            ) : listings.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4'}>
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} compact={viewMode === 'list'} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#0F172A] text-white px-3 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Search className="w-7 h-7 text-[#94A3B8]" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No listings found</h3>
      <p className="text-[#64748B] text-sm mb-5">Try adjusting your filters or search query.</p>
      <button onClick={onReset} className="text-sm font-semibold text-[#475569] hover:underline">
        Clear all filters
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Search className="w-7 h-7 text-[#94A3B8]" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Something went wrong</h3>
      <p className="text-[#64748B] text-sm mb-5">{message}</p>
      <button onClick={onRetry} className="text-sm font-semibold text-[#0F172A] border border-[#0F172A] px-4 py-2 rounded-xl hover:bg-[#0F172A] hover:text-white transition-all">
        Try again
      </button>
    </div>
  );
}
