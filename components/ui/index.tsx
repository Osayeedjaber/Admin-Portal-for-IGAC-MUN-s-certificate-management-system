"use client";

import { useState, ReactNode } from "react";

// ============================================
// Tooltip Component
// ============================================
interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#001c14] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#001c14] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#001c14] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#001c14] border-y-transparent border-l-transparent',
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="px-3 py-1.5 text-xs font-medium text-[#faf4ea] bg-[#001c14] rounded-lg border border-[#faf4ea]/10 shadow-xl whitespace-nowrap">
            {content}
            <div className={`absolute border-4 ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Badge Component
// ============================================
interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-[#faf4ea]/10 text-[#faf4ea] border-[#faf4ea]/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ============================================
// Toggle Switch Component
// ============================================
interface ToggleProps {
  enabled: boolean;
  onChange: () => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ enabled, onChange, label, description, size = 'md' }: ToggleProps) {
  const sizes = {
    sm: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
    },
    md: {
      track: 'w-14 h-7',
      thumb: 'w-5 h-5',
      translate: 'translate-x-8',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 hover:bg-[#faf4ea]/10 transition-all duration-200 group"
    >
      {(label || description) && (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
            enabled ? 'bg-[#ffeccd]/30' : 'bg-[#faf4ea]/10'
          }`}>
            <svg className={`w-5 h-5 transition-colors duration-300 ${enabled ? 'text-[#ffeccd]' : 'text-[#faf4ea]/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
            </svg>
          </div>
          <div className="text-left">
            {label && <p className={`font-medium transition-colors duration-300 ${enabled ? 'text-[#faf4ea]' : 'text-[#faf4ea]/70'}`}>{label}</p>}
            {description && <p className="text-xs text-[#faf4ea]/50">{description}</p>}
          </div>
        </div>
      )}
      <div className={`relative ${sizeConfig.track} rounded-full transition-all duration-300 ease-out ${
        enabled 
          ? 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea]' 
          : 'bg-[#001c14] border border-[#faf4ea]/20'
      }`}>
        <div className={`absolute top-1 ${sizeConfig.thumb} rounded-full shadow-lg transition-all duration-300 ease-out ${
          enabled 
            ? `${sizeConfig.translate} bg-[#000b07]` 
            : 'left-1 bg-[#faf4ea]/60'
        }`}>
          {enabled && (
            <svg className="w-3 h-3 text-[#ffeccd] absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

// ============================================
// Card Component
// ============================================
interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = false }: CardProps) {
  return (
    <div className={`rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 overflow-hidden ${
      hoverable ? 'hover:border-[#ffeccd]/30 transition-colors duration-300' : ''
    } ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-b border-[#faf4ea]/10 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`p-6 border-t border-[#faf4ea]/10 bg-[#000b07]/50 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// Spinner Component
// ============================================
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className={`${sizes[size]} rounded-full border-[#faf4ea]/30 border-t-[#ffeccd] animate-spin ${className}`} />
  );
}

// ============================================
// Empty State Component
// ============================================
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[#faf4ea]/5 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[#faf4ea] mb-2">{title}</h3>
      {description && <p className="text-[#faf4ea]/60 text-sm mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

// ============================================
// Skeleton Components
// ============================================
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#faf4ea]/10 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#faf4ea]/5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Confirmation Modal Component
// ============================================
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#001c14] border border-[#faf4ea]/10 shadow-2xl animate-fade-in">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#faf4ea] mb-2">{title}</h3>
          <p className="text-[#faf4ea]/70">{message}</p>
        </div>
        
        <div className="flex gap-3 p-6 border-t border-[#faf4ea]/10 bg-[#000b07]/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/5 transition disabled:opacity-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] hover:opacity-90'
            }`}
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
