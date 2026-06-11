import { Link } from 'react-router-dom';
import { LockKeyhole, X } from 'lucide-react';

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function AuthRequiredModal({
  open,
  onClose,
  title = 'Create an account to continue',
  message = 'Sign in or create a free account to save rooms, send inquiries, and manage your search.',
}: AuthRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close sign in prompt"
        className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F8FAFC] hover:text-[#475569]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#0F172A]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-[#0B1220]">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{message}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            to="/auth?mode=login"
            className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            Sign in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="rounded-xl bg-[#0F172A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e293b]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
