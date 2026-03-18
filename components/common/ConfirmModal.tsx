import React, { useEffect, useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Ya, Saya Yakin",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'fa-exclamation-triangle',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      confirmBtn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
    },
    warning: {
      icon: 'fa-exclamation-circle',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
    },
    info: {
      icon: 'fa-info-circle',
      iconBg: 'bg-[#016569]/10',
      iconColor: 'text-[#016569]',
      confirmBtn: 'bg-[#016569] hover:bg-[#015255] shadow-teal-200'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      ></div>
      
      {/* Modal Card */}
      <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-scaleIn border border-white/60">
        <div className="p-10 flex flex-col items-center text-center">
          {/* Close Button */}
          <button 
            onClick={onCancel}
            className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all hover:bg-slate-100"
          >
            <i className="fas fa-times text-sm"></i>
          </button>

          {/* Icon */}
          <div className={`w-24 h-24 ${style.iconBg} ${style.iconColor} rounded-[32px] flex items-center justify-center text-4xl mb-8 shadow-inner`}>
            <i className={`fas ${style.icon}`}></i>
          </div>

          {/* Text Content */}
          <h3 className="text-2xl font-display font-black text-slate-800 mb-4 tracking-tight leading-tight uppercase">
            {title}
          </h3>
          <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 px-4">
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onConfirm}
              className={`py-5 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all active:scale-95 shadow-xl ${style.confirmBtn}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="py-5 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200/50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
