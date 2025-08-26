'use client'
import CustomWorkflowBackground from '@/components/CustomWorkflowBackground'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Cpu,
  Globe,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Workflow,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    const elements = [heroRef.current, featuresRef.current, ctaRef.current]
    elements.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in bg-background"
      >
        <CustomWorkflowBackground />
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-12">
            {/* Floating Elements - Simplified */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-20 h-20 bg-gray-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute top-40 right-20 w-16 h-16 bg-gray-300 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute bottom-32 left-20 w-12 h-12 bg-muted rounded-full opacity-40 animate-float"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 bg-gray-400 rounded-full opacity-30 animate-pulse"></div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-space-grotesk font-bold tracking-tight leading-tight">
                <div className="relative inline-block">
                  <span className="text-foreground">The Ultimate</span>
                  <div className="absolute -inset-1 bg-gray-200/30 blur-lg -z-10 animate-pulse"></div>
                </div>
                <br />
                <div className="relative inline-block mt-4">
                  <span className="text-muted-foreground">Automation Hub</span>
                  <div className="absolute -inset-1 bg-gray-300/30 blur-xl -z-10 animate-pulse"></div>
                </div>
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                Where n8n, Make, Airtable, and Zapier workflows come together. Discover, share, and monetize your
                automation creations in one unified marketplace.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-primary hover:bg-gray-800 text-primary-foreground px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl"
              >
                <Link href="/workflows" className="relative flex items-center gap-3">
                  <Palette className="w-5 h-5" />
                  Explore Gallery
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group relative bg-background backdrop-blur-md border-2 border-border hover:border-gray-500 hover:bg-background px-10 py-5 text-lg font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 rounded-2xl shadow-lg hover:shadow-xl"
              >
                <Link href="/auth/register" className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-muted-foreground" />
                  Start Creating
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-20">
              <div className="group text-center p-6 rounded-3xl bg-background backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">15K+</div>
                <div className="text-muted-foreground font-medium">Magical Workflows</div>
              </div>
              <div className="group text-center p-6 rounded-3xl bg-muted backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">10K+</div>
                <div className="text-muted-foreground font-medium">Creative Minds</div>
              </div>
              <div className="group text-center p-6 rounded-3xl bg-background backdrop-blur-sm border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">$3M+</div>
                <div className="text-muted-foreground font-medium">Dreams Realized</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Interactive Hexagon Grid */}
      <div ref={featuresRef} className="relative py-32 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-muted-foreground mb-6 shadow-sm">
              <Globe className="w-4 h-4" />
              Discover the Magic
            </div>
            <h2 className="text-4xl sm:text-6xl font-space-grotesk font-bold mb-6 leading-tight text-foreground">
              Why Creators Choose Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              A sanctuary for automation artisans where creativity meets functionality in perfect harmony.
            </p>
          </div>

          {/* Interactive Feature Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Security */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-black">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-gray-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-foreground transition-colors duration-300">
                  Fortress Security
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your creations are protected by military-grade encryption and our guardian community of verified
                  artisans.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Military-grade protection
                </div>
              </div>
            </div>

            {/* Feature 2 - Prosperity */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700/5 to-gray-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  Instant Prosperity
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Transform your passion into profit with our enchanted marketplace that turns workflows into wealth.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  <div className="w-2 h-2 bg-gray-700 rounded-full mr-2"></div>
                  Monetize instantly
                </div>
              </div>
            </div>

            {/* Feature 3 - Deploy */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-gray-600">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 to-gray-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  Lightning Deploy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Watch your workflows come alive instantly with our magical one-click deployment spells.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                  One-click magic
                </div>
              </div>
            </div>

            {/* Feature 4 - Quality */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/5 to-gray-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-gray-800 transition-colors duration-300">
                  Artisan Quality
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every workflow is blessed by our council of automation wizards before joining the gallery.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-gray-800 transition-colors duration-300">
                  <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
                  Wizard-approved
                </div>
              </div>
            </div>

            {/* Feature 5 - Community */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-gray-500">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-300/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-background0 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  Sacred Circle
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join our mystical community of creators where knowledge flows freely and dreams take flight.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors duration-300">
                  <div className="w-2 h-2 bg-background0 rounded-full mr-2"></div>
                  Creator community
                </div>
              </div>
            </div>

            {/* Feature 6 - Support */}
            <div className="group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-border hover:border-gray-900">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-black/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-foreground transition-colors duration-300">
                  Divine Support
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our celestial support team guides you through every step of your automation journey.
                </p>
                <div className="mt-6 flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                  24/7 guidance
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-gray-800 transition-colors duration-300 cursor-pointer">
              <Workflow className="w-5 h-5" />
              <span className="font-medium">Explore All Features</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating decorative elements - Simplified */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-10 w-24 h-24 bg-gray-200/20 rounded-full blur-xl"></div>
          </div>

          <div className="relative p-16 rounded-[3rem] bg-background backdrop-blur-xl border-2 border-border shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-muted/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative">
              {/* Icon with floating animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-2xl animate-float">
                  <Workflow className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl bg-gray-400/40 blur-xl animate-pulse"></div>
              </div>

              <h2 className="text-4xl sm:text-6xl font-space-grotesk font-bold mb-8 leading-tight">
                <span className="text-foreground">Ready to Create Magic?</span>
              </h2>

              <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Step into a world where your automation dreams become reality. Join thousands of creators who've already
                discovered the magic of Neaply.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-primary hover:bg-gray-800 text-primary-foreground px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gray-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href="/auth/register" className="relative flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Begin Your Journey
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="group relative bg-background backdrop-blur-md border-2 border-border hover:border-gray-500 hover:bg-background px-12 py-6 text-xl font-bold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 rounded-2xl shadow-xl hover:shadow-2xl"
                >
                  <Link href="/workflows" className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-muted-foreground" />
                    Explore Gallery
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Trusted by 8K+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
