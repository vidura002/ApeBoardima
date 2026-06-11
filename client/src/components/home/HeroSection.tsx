import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { ACTIVE_AREAS } from '../../data/mockData';
import { Button } from '../ui/Button';

const POPULAR_SEARCHES = [
  'Boarding near SLIIT',
  'Single room Malabe',
  'Annex Kaduwela',
  'Girls hostel',
  'Furnished room',
];

const ROOM_TYPES = [
  { value: '', label: 'Any type' },
  { value: 'room', label: 'Room' },
  { value: 'boarding', label: 'Boarding' },
  { value: 'annex', label: 'Annex' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'shared', label: 'Shared' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (area) params.set('area', area);
    if (type) params.set('type', type);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40V0M40 0v40M0 0h40M0 40h40' stroke='%230F172A' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        {/* Pill tag */}
        <div className="inline-flex items-center gap-2 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-[#E5E7EB]">
          <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full" />
          Now serving Malabe and Kaduwela
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1220] leading-[1.08] tracking-tight mb-6">
          Find trusted rooms
          <br />
          <span className="text-[#0F172A] relative">
            near{' '}
            <span className="relative inline-block">
              SLIIT
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#0F172A] rounded-full" />
            </span>
            , Malabe.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto mb-10 leading-relaxed">
          Premium room rental and boarding discovery for students and young professionals —
          verified listings, real landlords, no guesswork.
        </p>

        {/* Search card */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-card-hover border border-[#E5E7EB] p-2 max-w-3xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Area select */}
            <div className="relative flex-shrink-0">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full sm:w-36 appearance-none pl-9 pr-8 py-3 text-sm text-[#0F172A] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all"
              >
                <option value="">All areas</option>
                {ACTIVE_AREAS.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Type select */}
            <div className="relative flex-shrink-0">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full sm:w-36 appearance-none pl-4 pr-8 py-3 text-sm text-[#0F172A] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all"
              >
                {ROOM_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Keyword input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
              <input
                type="text"
                placeholder='e.g. "furnished room near bus stop"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="sm:flex-shrink-0">
              Search
            </Button>
          </div>
        </form>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="text-xs text-[#94A3B8] font-medium">Popular:</span>
          {POPULAR_SEARCHES.map(term => (
            <button
              key={term}
              onClick={() => { setQuery(term); navigate(`/browse?q=${encodeURIComponent(term)}`); }}
              className="text-xs text-[#475569] bg-white border border-[#E5E7EB] hover:border-[#0F172A] hover:text-[#0F172A] px-3 py-1.5 rounded-full transition-all font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-[#E5E7EB] bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Active listings' },
              { number: '200+', label: 'Verified landlords' },
              { number: '2', label: 'Areas covered' },
              { number: '1,200+', label: 'Students housed' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#0F172A]">{stat.number}</div>
                <div className="text-sm text-[#64748B] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
