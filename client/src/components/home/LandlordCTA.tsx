import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, BarChart2, Users } from 'lucide-react';
import { Button } from '../ui/Button';

export default function LandlordCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left content */}
            <div className="p-10 lg:p-14">
              <p className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
                For landlords
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1220] leading-tight mb-4">
                List your room.
                <br />
                Reach thousands.
              </h2>
              <p className="text-[#64748B] mb-8 leading-relaxed text-lg">
                Over 5,000 students and professionals search ApeBoardima every month. Get your room in front
                of the right tenants — for free.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: DollarSign, text: 'Free to list your first property' },
                  { icon: BarChart2, text: 'Track views, saves and inquiries' },
                  { icon: Users, text: 'Connect with verified tenants only' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#0F172A]" />
                      </div>
                      <span className="text-sm text-[#475569] font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="primary"
                size="xl"
                onClick={() => navigate('/auth?mode=signup&role=landlord')}
              >
                Post your room for free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Right visual */}
            <div className="hidden lg:flex items-center justify-center bg-[#0F172A] p-14 relative overflow-hidden">
              {/* Background circles */}
              <div className="absolute w-96 h-96 rounded-full border border-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-72 h-72 rounded-full border border-white/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

              <div className="relative text-center">
                {/* Mock dashboard card */}
                <div className="bg-white rounded-2xl p-6 shadow-card-hover text-left max-w-xs">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
                      <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#94A3B8]">This month</div>
                      <div className="text-sm font-bold text-[#0F172A]">Listing performance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                      { label: 'Views', value: '312' },
                      { label: 'Saves', value: '24' },
                      { label: 'Inquiries', value: '8' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className="text-xl font-bold text-[#0F172A]">{s.value}</div>
                        <div className="text-xs text-[#94A3B8]">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0F172A] rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-1.5">68% profile completion</div>
                </div>

                <p className="text-white/50 text-sm mt-5">Your dashboard, at a glance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
