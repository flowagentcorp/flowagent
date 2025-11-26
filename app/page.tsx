import Link from 'next/link';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { 
  Zap, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  Mail,
  Calendar,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">FlowAgent</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 animate-scale-in">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">AI-Powered Real Estate CRM</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Automate Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Real Estate Pipeline
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            FlowAgent helps top-performing agents close more deals with intelligent lead management, 
            automated follow-ups, and seamless client communication.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-xl"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for real estate professionals who want to work smarter, not harder
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 animate-slide-down">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Smart Lead Management</h3>
              <p className="text-slate-400">
                Capture, score, and nurture leads automatically. Never let a hot prospect slip through the cracks.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 animate-slide-down" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Automated Follow-ups</h3>
              <p className="text-slate-400">
                Set it and forget it. AI-powered messaging keeps your pipeline warm while you focus on closing deals.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 animate-slide-down" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Unified Inbox</h3>
              <p className="text-slate-400">
                Email, SMS, and calls in one place. Connect with clients on any channel without switching apps.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 animate-slide-down" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Smart Scheduling</h3>
              <p className="text-slate-400">
                Book meetings, showings, and calls with automated calendar sync and intelligent reminders.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 animate-slide-down" style={{ animationDelay: '0.4s' }}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Real-Time Analytics</h3>
              <p className="text-slate-400">
                Track performance metrics, conversion rates, and pipeline health with beautiful dashboards.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 animate-slide-down" style={{ animationDelay: '0.5s' }}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Workflow Automation</h3>
              <p className="text-slate-400">
                Create custom workflows that run on autopilot. From lead capture to closing, automate the busy work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <Sparkles className="w-6 h-6 text-purple-400" />
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Used by Top-Performing Agents
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Join thousands of real estate professionals who have transformed their business with FlowAgent
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-sm">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">50M+</div>
                <div className="text-sm">Leads Managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">98%</div>
                <div className="text-sm">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 backdrop-blur-xl bg-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FlowAgent</span>
              </div>
              <p className="text-slate-400 text-sm">
                The AI-powered CRM built for modern real estate professionals.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="#" className="hover:text-slate-200 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Careers</Link></li>
                <li><Link href="/support" className="hover:text-slate-200 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-slate-200 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-slate-200 transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 FlowAgent. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                Terms
              </Link>
              <Link href="/support" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
