'use client'
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Shield, Star, TrendingUp, Download, Code, Workflow, Sparkles, Globe, Layers, Cpu, Palette, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react'
import CustomWorkflowBackground from '@/components/CustomWorkflowBackground';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
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
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in bg-gray-50">
        <CustomWorkflowBackground />
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-12">
            {/* Floating Elements - Simplified */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-20 h-20 bg-gray-200 rounded-full opacity-60 animate-float"></div>
              <div className="absolute top-40 right-20 w-16 h-16 bg-gray-300 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute bottom-32 left-20 w-12 h-12 bg-gray-100 rounded-full opacity-40 animate-float"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 bg-gray-400 rounded-full opacity-30 animate-pulse"></div>
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-100 backdrop-blur-md border border-gray-300 text-sm font-medium text-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
              <Sparkles className="w-4 h-4 text-gray-600" />
              The Future of Workflow Automation
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-space-grotesk font-bold tracking-tight leading-tight">
                <div className="relative inline-block">
                  <span className="text-black">
                    Craft & Share
                  </span>
                  <div className="absolute -inset-1 bg-gray-200/30 blur-lg -z-10 animate-pulse"></div>
                </div>
                <br />
                <div className="relative inline-block mt-4">
                  <span className="text-gray-700">
                    n8n Magic
                  </span>
                  <div className="absolute -inset-1 bg-gray-300/30 blur-xl -z-10 animate-pulse"></div>
                </div>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
                Where automation dreams come to life. Discover enchanting workflows, share your creations, and join a community of digital artisans.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="group relative overflow-hidden bg-black hover:bg-gray-800 text-white px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl">
                <Link href="/workflows" className="relative flex items-center gap-3">
                  <Palette className="w-5 h-5" />
                  Explore Gallery
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="group relative bg-white backdrop-blur-md border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 px-10 py-5 text-lg font-semibold text-gray-700 hover:text-black transition-all duration-300 hover:scale-105 rounded-2xl shadow-lg hover:shadow-xl">
                <Link href="/auth/register" className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-gray-600" />
                  Start Creating
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-20">
              <div className="group text-center p-6 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-black mb-2">15K+</div>
                <div className="text-gray-600 font-medium">Magical Workflows</div>
              </div>
              <div className="group text-center p-6 rounded-3xl bg-gray-100 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-black mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Creative Minds</div>
              </div>
              <div className="group text-center p-6 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl font-bold text-black mb-2">$3M+</div>
                <div className="text-gray-600 font-medium">Dreams Realized</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Decorative Elements - Simplified */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-1/4 w-40 h-40 bg-gray-100/15 rounded-full blur-2xl"></div>
          </div>
          
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 backdrop-blur-sm border border-gray-300 text-sm font-medium text-gray-700 mb-6">
              <Globe className="w-4 h-4" />
              Discover the Magic
            </div>
            <h2 className="text-4xl sm:text-6xl font-space-grotesk font-bold mb-6 leading-tight">
              <span className="text-black">
                Why Creators Choose Us
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              A sanctuary for automation artisans where creativity meets functionality in perfect harmony.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Fortress Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your creations are protected by military-grade encryption and our guardian community of verified artisans.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Instant Prosperity</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transform your passion into profit with our enchanted marketplace that turns workflows into wealth.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-600 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Lightning Deploy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch your workflows come alive instantly with our magical one-click deployment spells.
                </p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Artisan Quality</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every workflow is blessed by our council of automation wizards before joining the gallery.
                </p>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-500 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Sacred Circle</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join our mystical community of creators where knowledge flows freely and dreams take flight.
                </p>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="group relative p-8 rounded-3xl bg-gray-50 backdrop-blur-sm border border-gray-200 hover:border-gray-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 bg-gray-100/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Divine Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our celestial support team guides you through every step of your automation journey.
                </p>
              </div>
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
          
          <div className="relative p-16 rounded-[3rem] bg-gray-50 backdrop-blur-xl border-2 border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gray-100/20 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative">
              {/* Icon with floating animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-black flex items-center justify-center shadow-2xl animate-float">
                  <Workflow className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl bg-gray-400/40 blur-xl animate-pulse"></div>
              </div>
              
              <h2 className="text-4xl sm:text-6xl font-space-grotesk font-bold mb-8 leading-tight">
                <span className="text-black">
                  Ready to Create Magic?
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Step into a world where your automation dreams become reality. Join thousands of creators who've already discovered the magic of FlowMarket.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button size="lg" className="group relative overflow-hidden bg-black hover:bg-gray-800 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 rounded-2xl">
                  <div className="absolute inset-0 bg-gray-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href="/auth/register" className="relative flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    Begin Your Journey
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </Button>
                
                <Button size="lg" variant="outline" className="group relative bg-white backdrop-blur-md border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 px-12 py-6 text-xl font-bold text-gray-700 hover:text-black transition-all duration-300 hover:scale-110 rounded-2xl shadow-xl hover:shadow-2xl">
                  <Link href="/workflows" className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-gray-600" />
                    Explore Gallery
                  </Link>
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
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
  );
}
