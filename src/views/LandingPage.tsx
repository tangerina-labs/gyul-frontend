/**
 * LandingPage - Minimalist landing page for gyul
 * 
 * Visual thinking app for deep exploration.
 * Inspirational design with generous whitespace and orange Design System.
 * 
 * This page is pre-rendered at build time (SSG) for optimal SEO.
 */
import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import lottie from 'lottie-web'
import type { AnimationItem } from 'lottie-web'
import logoAnimationData from '../assets/logo.json'

export function LandingPage() {
  const lottieContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animation: AnimationItem | null = null

    if (lottieContainer.current) {
      animation = lottie.loadAnimation({
        container: lottieContainer.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: logoAnimationData,
      })
    }

    return () => {
      animation?.destroy()
    }
  }, [])

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Logo */}
          <div className="mb-4 md:mb-6 flex flex-col items-center">
            <div
              ref={lottieContainer}
              className="w-48 md:w-56 mx-auto"
              aria-label="gyul animated logo"
            />
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Transform fleeting tweets into lasting understanding
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-gray-600 font-normal mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
            Stop scrolling, start thinking. Gyul turns bite-sized content into
            structured knowledge you can explore, question, and build upon.
          </p>

          {/* Input Section (Demonstrative) */}
          <div className="mb-5 md:mb-6">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <input
                type="text"
                readOnly
                placeholder="Paste a tweet URL to begin..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 font-normal focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-default text-base shadow-sm"
              />
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to="/canvases"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg transition-colors duration-200 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-base shadow-sm"
          >
            Start exploring
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 md:py-5 text-center border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span className="font-medium text-gray-900 text-sm md:text-base">gyul</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs md:text-sm">Peel ideas, one layer at a time</span>
        </div>
      </footer>
    </div>
  )
}
