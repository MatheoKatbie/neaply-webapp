'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Play, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const { user } = useAuth()
  const router = useRouter()
  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden pt-[200px] bg-[#08080A]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero.png" alt="FlowMarket Hero Background" className="w-full h-full object-cover" />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 text-center text-white">
        <p className="font-aeonikpro text-[#BCBFCC] font-[18px]">Welcome to the workflows marketplace — neaply</p>
        {/* Main Heading */}
        <h1 className="font-aeonikpro text-4xl md:text-6xl lg:text-7xl text-[#EDEFF7] leading-[86px] tracking-[-2%] mb-6">
          Automate your world,
          <br />
          <span>Elevate your workforce.</span>
        </h1>

        {/* Subheading */}
        <p className="font-aeonikpro text-[20px]  text-[#D3D6E0] mb-8 max-w-3xl mx-auto leading-relaxed">
          We envision a world where automation and innovation converge seamlessly, empowering individuals and businesses
          to transcend manual constraints and unlock their true potential.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 items-center mb-12">
          <button
            onClick={() => router.push('/register')}
            className="font-aeonikpro bg-white text-black hover:bg-gray-100 py-3 px-6 text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            Get started — it's free
          </button>

          <button
            onClick={() => router.push('/become-seller')}
            className="relative font-aeonikpro bg-transparent text-white py-3 px-6 text-lg transition-all duration-300 cursor-pointer group"
          >
            Upload workflow
            <span className="absolute left-0 bottom-1 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
          </button>
        </div>

        {/* Explore by platforms section */}
        <div className="mb-12">
          <h2 className="font-aeonikpro text-white text-2xl font-medium mb-8 text-left">Explore by platforms</h2>

          <div className="flex flex-wrap justify-center gap-6">
            {/* n8n Card */}
            <div
              className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="relative w-12 h-12">
                <img
                  src="/images/hero/n8n-grey.png"
                  alt="n8n"
                  className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src="/images/hero/n8n-color.png"
                  alt="n8n"
                  className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
              </div>
              <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                n8n
              </span>
            </div>

            {/* Zapier Card */}
            <div
              className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="relative w-12 h-12">
                <img
                  src="/images/hero/zapier-grey.png"
                  alt="Zapier"
                  className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src="/images/hero/zapier-color.png"
                  alt="Zapier"
                  className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
              </div>
              <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                Zapier
              </span>
            </div>

            {/* Make Card */}
            <div
              className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="relative w-12 h-12">
                <img
                  src="/images/hero/make-grey.png"
                  alt="Make"
                  className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src="/images/hero/make-color.png"
                  alt="Make"
                  className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
              </div>
              <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                Make
              </span>
            </div>

            {/* Airtable Card */}
            <div
              className="w-[233px] h-[171px] border border-[#1E1E24] rounded-lg relative cursor-pointer transition-all duration-300 flex flex-col items-center justify-center hover:bg-[#D3D6E0] bg-[rgba(211,214,224,0.05)] group"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="relative w-12 h-12">
                <img
                  src="/images/hero/airtable-grey.png"
                  alt="Airtable"
                  className="w-12 h-12 object-contain transition-opacity duration-300 group-hover:opacity-0"
                />
                <img
                  src="/images/hero/airtable-color.png"
                  alt="Airtable"
                  className="w-12 h-12 object-contain absolute top-0 left-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                />
              </div>
              <span className="font-aeonikpro text-[#9DA2B3] group-hover:text-[#40424D] text-xl font-medium absolute bottom-4 left-4 transition-colors duration-300">
                Airtable
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
