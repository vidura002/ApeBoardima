import { Link } from 'react-router-dom';
import { Home, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-[#0F172A]" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">ApeBoardima</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
              Find trusted rooms, boarding houses, annexes and shared accommodation near SLIIT and Malabe.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Browse</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Listings', href: '/browse' },
                { label: 'Boarding Houses', href: '/browse?type=boarding' },
                { label: 'Annexes', href: '/browse?type=annex' },
                { label: 'Apartments', href: '/browse?type=apartment' },
                { label: 'Rooms', href: '/browse?type=room' },
                { label: 'Hostels', href: '/browse?type=hostel' },
              ].map(item => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-[#94A3B8] hover:text-white transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Areas</h4>
            <ul className="space-y-3">
              {['Malabe', 'Kaduwela'].map(area => (
                <li key={area}>
                  <Link
                    to={`/browse?area=${area}`}
                    className="text-[#94A3B8] hover:text-white transition-colors text-sm"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-[#94A3B8] text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#64748B]" />
                <span>Malabe, Colombo District, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2.5 text-[#94A3B8] text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#64748B]" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5 text-[#94A3B8] text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#64748B]" />
                <span>hello@apeboardima.lk</span>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
              <ul className="space-y-2.5">
                {['About us', 'Privacy Policy', 'Terms of Service', 'Help Centre'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-[#94A3B8] hover:text-white transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#64748B] text-sm">
            © {new Date().getFullYear()} ApeBoardima. All rights reserved.
          </p>
          <p className="text-[#64748B] text-sm">
            Built for students & professionals in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}
