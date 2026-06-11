import { X, SlidersHorizontal } from 'lucide-react';
import { ACTIVE_AREAS } from '../../data/mockData';
import { Button } from '../ui/Button';
import { useAreaListingCounts } from '../../hooks/useAreaListingCounts';
import type { SearchFilters } from '../../types';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (partial: Partial<SearchFilters>) => void;
  onReset: () => void;
  resultCount: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const TYPES = [
  { value: '', label: 'All types' },
  { value: 'room', label: 'Room' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'annex', label: 'Annex' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'shared', label: 'Shared' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Males only' },
  { value: 'female', label: 'Females only' },
  { value: 'mixed', label: 'Mixed' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most popular' },
];

const PRICE_RANGES = [
  { min: '', max: '', label: 'Any price' },
  { min: 0, max: 8000, label: 'Under Rs. 8,000' },
  { min: 8000, max: 15000, label: 'Rs. 8,000 – 15,000' },
  { min: 15000, max: 30000, label: 'Rs. 15,000 – 30,000' },
  { min: 30000, max: 60000, label: 'Rs. 30,000 – 60,000' },
  { min: 60000, max: '', label: 'Above Rs. 60,000' },
];

export default function FilterPanel({
  filters,
  onChange,
  onReset,
  resultCount,
  mobileOpen = true,
  onMobileClose,
}: FilterPanelProps) {
  const { counts, loading } = useAreaListingCounts();
  const hasActiveFilters =
    filters.area !== '' ||
    filters.type !== '' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.gender !== '' ||
    filters.furnished !== '';

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F1F5F9] ${
        !mobileOpen ? 'hidden lg:block' : 'block'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#475569]" />
          <span className="font-semibold text-[#0F172A] text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-[#0F172A] rounded-full" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-[#475569] font-medium hover:text-[#1D4ED8] transition-colors"
            >
              Clear all
            </button>
          )}
          {onMobileClose && (
            <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-[#F8FAFC] lg:hidden">
              <X className="w-4 h-4 text-[#475569]" />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={e => onChange({ sortBy: e.target.value as SearchFilters['sortBy'] })}
          className="w-full text-sm text-[#0F172A] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] bg-white"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Area */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Area
        </label>
        <div className="space-y-1">
          <FilterChip
            label="All areas"
            active={filters.area === ''}
            onClick={() => onChange({ area: '' })}
          />
	          {ACTIVE_AREAS.map(area => (
	            <FilterChip
	              key={area.id}
	              label={`${area.name} (${loading ? '...' : counts[area.name] ?? 0})`}
	              active={filters.area === area.name}
              onClick={() => onChange({ area: filters.area === area.name ? '' : area.name })}
            />
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Accommodation type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => onChange({ type: t.value as SearchFilters['type'] })}
              className={`text-xs font-medium px-3 py-2 rounded-lg text-center transition-all ${
                filters.type === t.value
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Price range
        </label>
        <div className="space-y-1">
          {PRICE_RANGES.map(range => (
            <FilterChip
              key={range.label}
              label={range.label}
              active={filters.minPrice === range.min && filters.maxPrice === range.max}
              onClick={() => onChange({ minPrice: range.min as SearchFilters['minPrice'], maxPrice: range.max as SearchFilters['maxPrice'] })}
            />
          ))}
        </div>
      </div>

      {/* Gender policy */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Gender policy
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {GENDER_OPTIONS.map(g => (
            <button
              key={g.value}
              onClick={() => onChange({ gender: g.value as SearchFilters['gender'] })}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-all ${
                filters.gender === g.value
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Furnished */}
      <div className="p-5">
        <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
          Furnished
        </label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Any' },
            { value: true, label: 'Furnished' },
            { value: false, label: 'Unfurnished' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => onChange({ furnished: opt.value as SearchFilters['furnished'] })}
              className={`flex-1 text-xs font-medium px-2 py-2 rounded-lg transition-all ${
                filters.furnished === opt.value
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count footer */}
      <div className="p-5">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onMobileClose}
          className="lg:hidden"
        >
          Show {resultCount} result{resultCount !== 1 ? 's' : ''}
        </Button>
        <p className="hidden lg:block text-xs text-center text-[#94A3B8]">
          {resultCount} listing{resultCount !== 1 ? 's' : ''} found
        </p>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-xs font-medium px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-[#0F172A] text-white'
          : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
      }`}
    >
      {label}
    </button>
  );
}
