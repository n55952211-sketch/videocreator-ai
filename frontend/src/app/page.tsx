'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Play, Zap, ArrowRight } from 'lucide-react'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      {/* Navigation */}
      <nav className="bg-dark-900 border-b border-dark-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-bold text-xl">VideoCreator AI</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-8">
              <a href="#features" className="hover:text-brand-primary transition">Features</a>
              <a href="#pricing" className="hover:text-brand-primary transition">Pricing</a>
              <a href="#docs" className="hover:text-brand-primary transition">Docs</a>
            </div>

            <div className="hidden md:flex gap-4">
              <Link
                href="/auth/login"
                className="px-6 py-2 text-dark-300 hover:text-dark-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg hover:shadow-lg hover:shadow-brand-primary/50 transition transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-dark-800">
              <a href="#features" className="block py-2 hover:text-brand-primary">Features</a>
              <a href="#pricing" className="block py-2 hover:text-brand-primary">Pricing</a>
              <a href="#docs" className="block py-2 hover:text-brand-primary">Docs</a>
              <Link href="/auth/login" className="block py-2 hover:text-brand-primary">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block mt-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
              Create Videos with AI
            </h1>
            <p className="text-xl text-dark-300 mb-8">
              Generate stunning short-form videos in minutes. Write scripts, add voiceovers, auto-caption, and export—all powered by AI.
            </p>
            <div className="flex gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-semibold hover:shadow-lg hover:shadow-brand-primary/50 transition transform hover:scale-105 flex items-center gap-2"
              >
                Start Creating <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#demo"
                className="px-8 py-3 border border-dark-700 rounded-lg font-semibold hover:bg-dark-800 transition"
              >
                Watch Demo
              </a>
            </div>
          </div>
          <div className="bg-dark-800 rounded-lg overflow-hidden border border-dark-700 h-96 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4 text-brand-primary" />
              <p className="text-dark-400">Video Preview Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "AI Script Generation",
                description: "Generate viral scripts for Reddit stories, fake texts, and more with AI."
              },
              {
                icon: <Play className="w-8 h-8" />,
                title: "Natural Voiceovers",
                description: "Choose from diverse AI voices or upload your own. Perfect lip-sync timing."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Auto-Captions",
                description: "Automatic subtitles with customizable fonts, colors, and animations."
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-dark-800 border border-dark-700 rounded-lg p-8 hover:border-brand-primary/50 transition"
              >
                <div className="text-brand-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Create?</h2>
        <p className="text-xl text-dark-400 mb-8 max-w-2xl mx-auto">
          Join thousands of creators using VideoCreator AI to produce engaging short-form content.
        </p>
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-semibold hover:shadow-lg hover:shadow-brand-primary/50 transition transform hover:scale-105"
        >
          Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-dark-400">
          <p>&copy; 2024 VideoCreator AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
