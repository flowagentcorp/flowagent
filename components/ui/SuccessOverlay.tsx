'use client';

import { CheckCircle2, Sparkles } from 'lucide-react';

interface SuccessOverlayProps {
  title?: string;
  message?: string;
}

export default function SuccessOverlay({ 
  title = 'Success!', 
  message = 'Your account has been created' 
}: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Animated particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Content */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-12 text-center animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
          </div>

          <p className="text-lg text-slate-300 mb-6 max-w-md">
            {message}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
