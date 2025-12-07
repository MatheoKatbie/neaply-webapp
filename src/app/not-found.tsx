'use client'

import CustomWorkflowBackground from '@/components/CustomWorkflowBackground'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Search, Workflow } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function NotFound() {
    const containerRef = useRef<HTMLDivElement>(null)

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

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
            {/* Background Animation */}
            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 animate-fade-in bg-background">
                <CustomWorkflowBackground />

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-20 h-20 bg-[#40424D]/40 rounded-full opacity-60 animate-float"></div>
                    <div className="absolute top-40 right-20 w-16 h-16 bg-gray-300 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-32 left-20 w-12 h-12 bg-muted rounded-full opacity-40 animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-24 h-24 bg-gray-400 rounded-full opacity-30 animate-pulse"></div>
                </div>

                {/* Main Content */}
                <div ref={containerRef} className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="space-y-12">
                        {/* 404 Number */}
                        <div className="space-y-6">
                            <div className="relative">
                                <h1 className="text-8xl sm:text-9xl lg:text-[12rem] font-space-grotesk font-bold tracking-tight leading-none text-foreground">
                                    <div className="relative inline-block">
                                        <span>404</span>
                                        <div className="absolute -inset-4 bg-[#40424D]/40/30 blur-2xl -z-10 animate-pulse"></div>
                                    </div>
                                </h1>
                            </div>

                            {/* Error Message */}
                            <div className="space-y-4">
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-space-grotesk font-bold text-foreground">
                                    Page Not Found
                                </h2>
                                <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                                    Oops! It looks like this workflow has wandered off into the digital void.
                                    Let's get you back to creating magic.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button
                                size="lg"
                                className="group relative overflow-hidden bg-primary hover:bg-gray-800 text-primary-foreground px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl"
                            >
                                <Link href="/" className="relative flex items-center gap-3">
                                    <Home className="w-5 h-5" />
                                    Back to Home
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="group relative bg-background backdrop-blur-md border-2 border-border hover:border-gray-500 hover:bg-background px-10 py-5 text-lg font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 rounded-2xl shadow-lg hover:shadow-xl"
                            >
                                <Link href="/marketplace" className="flex items-center gap-3">
                                    <Search className="w-5 h-5 text-muted-foreground" />
                                    Explore Workflows
                                </Link>
                            </Button>
                        </div>

                        {/* Contact Support */}
                        <div className="pt-8">
                            <p className="text-muted-foreground">
                                Still lost?{' '}
                                <Link href="/help" className="text-primary hover:text-gray-800 underline underline-offset-4 transition-colors">
                                    Contact our support team
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
