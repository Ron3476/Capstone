import Link from 'next/link';
import {
  GraduationCap, Brain, Users, BarChart3, Heart, Shield,
  ArrowRight, CheckCircle,
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Tutor', desc: 'Personalized tutoring aligned with Kenyan CBC curriculum' },
  { icon: BarChart3, title: 'Student Success AI', desc: 'Predict risks and recommend interventions early' },
  { icon: Heart, title: 'Well-being Monitor', desc: 'Daily mood check-ins with counselor escalation' },
  { icon: Users, title: 'Parent Intelligence', desc: 'Weekly AI-generated progress reports for parents' },
  { icon: GraduationCap, title: 'Career Guidance', desc: 'University, TVET, and scholarship recommendations' },
  { icon: Shield, title: 'Multi-Agent Safety', desc: 'Scout, Tutor, Guardian, and Teacher agent pipeline' },
];

const portals = ['Students', 'Teachers', 'Parents', 'Administrators', 'Counselors'];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">EduSavvy AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary">Sign In</Link>
            <Link href="/login" className="btn-primary">Get Started <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-success-50 dark:from-brand-950 dark:via-gray-950 dark:to-gray-900" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            Built for African Schools
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Intelligent Education<br />
            <span className="text-brand-600">for Every Learner</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            EduSavvy AI connects students, teachers, parents, and counselors through
            a single AI-powered platform — improving academic performance, well-being,
            and career readiness across Africa.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {portals.map((p) => (
              <span key={p} className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium">
                {p}
              </span>
            ))}
          </div>
          <Link href="/login" className="btn-primary text-base px-8 py-3">
            Start Free Demo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Powered by Intelligent AI</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your School?</h2>
          <p className="text-brand-100 mb-8">Join thousands of schools across Africa using EduSavvy AI</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {['GDPR Compliant', 'Kenya DPA Compliant', 'Role-Based Access', 'End-to-End Encryption'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-400">
        © 2026 EduSavvy AI. Empowering African Education.
      </footer>
    </div>
  );
}
