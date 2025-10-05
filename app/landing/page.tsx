'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [earlyTester, setEarlyTester] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, testingOptIn: boolean) => {
    e.preventDefault();
    setLoading(true);
    setEarlyTester(testingOptIn);

    // TODO: Integrate with your backend/email service
    // For now, just simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-cream">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 border shadow-soft text-center" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)' }}>
            <svg className="w-10 h-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy mb-4">
            {earlyTester ? "Welcome to Early Testing! 🎉" : "You're on the list! 📬"}
          </h1>

          <p className="text-base text-slate mb-6 leading-relaxed">
            {earlyTester
              ? "Thank you for joining our early testing program. We'll be in touch within 48 hours with access details and next steps."
              : "We'll notify you as soon as we launch. Get ready to transform your ADHD parenting journey."
            }
          </p>

          <p className="text-sm text-slate-light mb-8">
            Check your email at <strong className="text-navy">{email}</strong>
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="px-6 py-3 rounded-full font-display font-semibold text-navy transition-all hover:scale-105"
            style={{ background: 'rgba(227, 234, 221, 0.5)', border: '1px solid rgba(215, 205, 236, 0.3)' }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Watercolor gradient background */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(135deg, rgba(227, 234, 221, 0.6) 0%, rgba(215, 205, 236, 0.6) 50%, rgba(183, 211, 216, 0.5) 100%)',
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='a' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Cpath filter='url(%23a)' opacity='.05' d='M0 0h200v200H0z'/%3E%3C/svg%3E\")"
          }}
        />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(215, 205, 236, 0.3)',
              boxShadow: '0 2px 8px rgba(42, 63, 90, 0.05)'
            }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#E6A897' }}></div>
              <span className="text-sm font-display font-semibold text-navy">Now Accepting Early Testers</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-navy mb-6 leading-tight">
              You're not alone<br />in this journey
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate mb-8 leading-relaxed">
              AI-powered coaching that helps parents of ADHD children discover their own solutions through guided, therapeutic conversations.
            </p>

            {/* Key differentiator */}
            <div className="inline-block px-6 py-3 rounded-2xl mb-12" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(215, 205, 236, 0.2)'
            }}>
              <p className="text-base text-navy">
                <strong className="font-display">Not a chatbot.</strong> A 50-minute coaching session using the proven GROW model.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="#early-access"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-display font-semibold text-navy transition-all hover:scale-105 hover:shadow-hover shadow-soft text-lg"
                style={{ background: 'linear-gradient(to right, #E6A897, #F0D9DA)' }}
              >
                Join Early Testing →
              </a>

              <a
                href="#early-access"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-display font-semibold text-navy transition-all hover:scale-105 bg-white border shadow-bubble text-lg"
                style={{ borderColor: 'rgba(215, 205, 236, 0.3)' }}
              >
                Notify Me at Launch
              </a>
            </div>

            {/* Trust indicator */}
            <p className="text-sm text-slate-light">
              Evidence-based • Crisis-safe • GDPR compliant
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-navy mb-4">
              Coaching, not consulting
            </h2>
            <p className="text-lg text-slate max-w-2xl mx-auto">
              We don't give you answers. We help you discover them. Because you're the expert on your child.
            </p>
          </div>

          {/* GROW Model Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Goal */}
            <div className="bg-white rounded-2xl p-6 border shadow-soft hover:shadow-hover transition-all" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#E3EADD' }}>
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Goal</h3>
              <p className="text-sm text-slate leading-relaxed">
                What do you want to achieve? We help you clarify your objectives and what success looks like.
              </p>
            </div>

            {/* Reality */}
            <div className="bg-white rounded-2xl p-6 border shadow-soft hover:shadow-hover transition-all" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#D7CDEC' }}>
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Reality</h3>
              <p className="text-sm text-slate leading-relaxed">
                Deep exploration of your situation. We spend 60% of our time here, understanding what's really happening.
              </p>
            </div>

            {/* Options */}
            <div className="bg-white rounded-2xl p-6 border shadow-soft hover:shadow-hover transition-all" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#B7D3D8' }}>
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Options</h3>
              <p className="text-sm text-slate leading-relaxed">
                What could you try? We explore possibilities together, drawing on your strengths and our evidence base.
              </p>
            </div>

            {/* Will */}
            <div className="bg-white rounded-2xl p-6 border shadow-soft hover:shadow-hover transition-all" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#F0D9DA' }}>
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Will</h3>
              <p className="text-sm text-slate leading-relaxed">
                Your action plan. You leave with concrete steps you've chosen, not prescriptions we've given.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ backgroundColor: 'rgba(227, 234, 221, 0.2)' }}>
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-navy mb-4">
              Built with care, powered by AI
            </h2>
            <p className="text-lg text-slate max-w-2xl mx-auto">
              Every feature designed with ADHD parents in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)' }}>
                <svg className="w-8 h-8 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Crisis-Safe</h3>
              <p className="text-sm text-slate leading-relaxed">
                Automatic crisis detection with immediate access to emergency resources (999, Samaritans 116 123).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to right, #E3EADD, #B7D3D8)' }}>
                <svg className="w-8 h-8 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Evidence-Based</h3>
              <p className="text-sm text-slate leading-relaxed">
                Age-appropriate strategies from research, tailored to your child's development (5-17 years).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to right, #F0D9DA, #E6A897)' }}>
                <svg className="w-8 h-8 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">Private & Secure</h3>
              <p className="text-sm text-slate leading-relaxed">
                GDPR compliant, encrypted conversations. Your data is protected with enterprise-grade security.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof Placeholder */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-10 border shadow-soft" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
            <div className="flex justify-center mb-6">
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <svg key={star} className="w-6 h-6" style={{ color: '#E6A897' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>

            <blockquote className="text-xl text-slate mb-6 leading-relaxed italic">
              "This isn't just another ADHD app. It's like having a therapist who actually understands what it's like to parent a child who sees the world differently."
            </blockquote>

            <p className="text-sm font-display font-semibold text-navy">
              Sarah M., Parent of 9-year-old with ADHD
            </p>
            <p className="text-xs text-slate-light">Early Testing Participant</p>
          </div>
        </div>
      </section>

      {/* Early Access Form */}
      <section id="early-access" className="py-20 px-6" style={{ background: 'linear-gradient(to bottom, rgba(215, 205, 236, 0.15), rgba(183, 211, 216, 0.15))' }}>
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-semibold text-navy mb-4">
              Be part of something meaningful
            </h2>
            <p className="text-lg text-slate">
              Join our early testing program or get notified when we launch.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border shadow-soft" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-display font-semibold text-navy mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-6 py-4 rounded-full border text-base transition-all focus:ring-2"
                  style={{
                    borderColor: 'rgba(215, 205, 236, 0.3)',
                    backgroundColor: 'rgba(249, 247, 243, 0.5)',
                    boxShadow: 'inset 0 2px 4px rgba(42, 63, 90, 0.03)'
                  }}
                />
              </div>

              {/* Early Tester Opt-in */}
              <div className="checkbox-container">
                <div className="checkbox-icon">
                  <input
                    type="checkbox"
                    id="earlyTester"
                    checked={earlyTester}
                    onChange={(e) => setEarlyTester(e.target.checked)}
                  />
                  <svg className="checkbox-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <label htmlFor="earlyTester" className="cursor-pointer">
                  <strong className="text-navy">Yes, I want to be an early tester!</strong> I understand I'll get early access and can provide feedback to help shape the product.
                </label>
              </div>

              {/* Info Box */}
              {earlyTester && (
                <div className="p-4 rounded-2xl" style={{ backgroundColor: 'rgba(230, 168, 151, 0.1)', border: '1px solid rgba(230, 168, 151, 0.2)' }}>
                  <p className="text-sm text-slate leading-relaxed">
                    <strong className="text-navy">Early testers get:</strong> Free access during beta, priority support, and the ability to influence features before launch.
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {earlyTester ? (
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="flex-1 px-6 py-4 rounded-full font-display font-semibold text-navy transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                    style={{ background: 'linear-gradient(to right, #E6A897, #F0D9DA)' }}
                  >
                    {loading ? 'Submitting...' : 'Join Early Testing →'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="flex-1 px-6 py-4 rounded-full font-display font-semibold text-navy transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                    style={{ background: 'linear-gradient(to right, #D7CDEC, #B7D3D8)' }}
                  >
                    {loading ? 'Submitting...' : 'Notify Me at Launch'}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-light text-center">
                We respect your privacy. Unsubscribe anytime. See our{' '}
                <a href="#" className="underline text-navy">privacy policy</a>.
              </p>

            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(215, 205, 236, 0.2)', backgroundColor: 'rgba(249, 247, 243, 0.5)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="text-center md:text-left">
              <h3 className="font-display text-xl font-semibold text-navy mb-1">ADHD Support</h3>
              <p className="text-sm text-slate-light">Your AI therapeutic companion</p>
            </div>

            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate hover:text-navy transition-colors">About</a>
              <a href="#" className="text-slate hover:text-navy transition-colors">Privacy</a>
              <a href="#" className="text-slate hover:text-navy transition-colors">Terms</a>
              <a href="#" className="text-slate hover:text-navy transition-colors">Contact</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-xs text-slate-light" style={{ borderColor: 'rgba(215, 205, 236, 0.2)' }}>
            <p>© 2025 ADHD Support. This is not a replacement for professional medical or therapeutic care.</p>
            <p className="mt-2">If you're in crisis, call 999 (UK) or Samaritans 116 123</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
