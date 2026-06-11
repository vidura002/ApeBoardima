import type { ListingType } from '../../types';

const TYPE_LABELS: Record<ListingType, string> = {
  room: 'Room',
  boarding: 'Boarding',
  annex: 'Annex',
  hostel: 'Hostel',
  apartment: 'Apartment',
  shared: 'Shared',
};

interface TypeBadgeProps {
  type: ListingType;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'sm' }: TypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md bg-white/90 text-[#0F172A] border border-[#E5E7EB] ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

const VARIANT_STYLES = {
  default: 'bg-[#F1F5F9] text-[#475569]',
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  error: 'bg-red-50 text-red-700 border border-red-100',
  outline: 'border border-[#E5E7EB] text-[#475569] bg-transparent',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-md ${VARIANT_STYLES[variant]} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {children}
    </span>
  );
}
