import LoginForm from '@/components/auth/LoginForm';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | FlowAgent',
  description: 'Sign in to your FlowAgent account',
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full px-4 py-8">
        <LoginForm />
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-10 py-6 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-6">
          <a href="/privacy" className="hover:text-slate-200 transition-colors">
            Privacy
          </a>
          <a href="/terms" className="hover:text-slate-200 transition-colors">
            Terms
          </a>
          <a href="/support" className="hover:text-slate-200 transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
