import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, PhoneCall, BadgeCheck } from 'lucide-react';
import { Button } from '../ui/Button';

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Verified listings',
    description: 'Every listing that carries the verified badge has been reviewed for accuracy, legitimacy and safety by our local team.',
  },
  {
    icon: BadgeCheck,
    title: 'Trusted landlords',
    description: 'Landlords go through an ID verification process. You always know who you\'re dealing with before you visit.',
  },
  {
    icon: Star,
    title: 'Honest photos & descriptions',
    description: 'We enforce a strict no-stock-photo policy. All images must be real, current photos of the actual property.',
  },
  {
    icon: PhoneCall,
    title: 'Direct contact always',
    description: 'No booking fees, no commission. Contact landlords directly via call or WhatsApp — the way it should work.',
  },
];

export default function TrustSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-[#0F172A] text-white overflow-hidden relative">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div>
            <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
              Why ApeBoardima
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
              Built for trust.
              <br />
              Designed for students.
            </h2>
            <p className="text-[#94A3B8] text-lg leading-relaxed mb-8">
              Finding a room in Malabe is stressful. Unreliable listings, unresponsive landlords, and overpriced dumps.
              ApeBoardima was built to change that — one verified listing at a time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/browse')}
                className="border-white text-white hover:bg-white hover:text-[#0F172A]"
              >
                Browse rooms
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/auth?mode=signup&role=landlord')}
                className="text-[#94A3B8] hover:text-white hover:bg-white/10"
              >
                List your property →
              </Button>
            </div>
          </div>

          {/* Right grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TRUST_POINTS.map(point => {
              const Icon = point.icon;
              return (
                <div
                  key={point.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors"
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{point.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{point.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
