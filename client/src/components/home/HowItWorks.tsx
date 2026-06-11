import { Search, MessageSquare, KeySquare } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    number: '01',
    title: 'Search & filter',
    description:
      'Browse hundreds of verified listings by area, type, price and gender policy. Use landmark-based search to find rooms closest to SLIIT, Horizon, or key bus stops.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Contact directly',
    description:
      'Reach landlords via phone or WhatsApp with a single tap. No middlemen, no hidden fees — just direct, honest communication with verified property owners.',
  },
  {
    icon: KeySquare,
    number: '03',
    title: 'Move in with confidence',
    description:
      'Every verified listing has been reviewed by our team. See photos, read real descriptions, check amenities and know exactly what you\'re getting before you visit.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1220] leading-tight">
            Find your perfect room
            <br />
            in three steps.
          </h2>
          <p className="text-[#64748B] mt-4 text-lg">
            We make room hunting simple, safe and stress-free for students and young professionals.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] right-0 h-px border-t-2 border-dashed border-[#E5E7EB]" />
                )}

                <div className="relative">
                  {/* Icon + number */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-5xl font-black text-[#F1F5F9]">{step.number}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0B1220] mb-3">{step.title}</h3>
                  <p className="text-[#64748B] leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
