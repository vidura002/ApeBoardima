import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ACTIVE_AREAS } from '../../data/mockData';
import { useAreaListingCounts } from '../../hooks/useAreaListingCounts';

export default function AreaCards() {
  const navigate = useNavigate();
  const { counts, loading } = useAreaListingCounts();

  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">
            Locations
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1220]">
            Browse by area
          </h2>
          <p className="text-[#64748B] mt-3 max-w-xl mx-auto">
            We are currently available in Malabe and Kaduwela.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {ACTIVE_AREAS.map(area => (
	            <AreaCard
	              key={area.id}
	              area={area}
	              count={counts[area.name] ?? 0}
	              loadingCount={loading}
	              onClick={() => navigate(`/browse?area=${area.name}`)}
	            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface AreaCardProps {
  area: { id: string; name: string; tagline: string; image: string };
  count: number;
  loadingCount: boolean;
  onClick: () => void;
}

function AreaCard({ area, count, loadingCount, onClick }: AreaCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl text-left cursor-pointer"
      style={{ paddingBottom: '58%' }}
    >
      {/* Image */}
      <img
        src={imgError ? `https://picsum.photos/seed/area-fallback-${area.id}/600/400` : area.image}
        alt={area.name}
        onError={() => setImgError(true)}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-[#0B1220]/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{area.name}</h3>
            <p className="text-white/70 text-xs mt-0.5">{area.tagline}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-bold text-sm">{loadingCount ? '...' : count}</span>
            <span className="text-white/60 text-xs">listings</span>
          </div>
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </button>
  );
}
