'use client';

import { motion } from 'framer-motion';

interface HeroBannerSkeletonProps {}

export default function HeroBannerSkeleton({}: HeroBannerSkeletonProps) {
  return (
    <section className="relative h-[80vh] min-h-[700px] overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content Skeleton */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
            
            {/* Left Content Skeleton */}
            <div className="space-y-8">
              {/* Role Skeleton */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-1 bg-white/20 rounded-full animate-pulse" />
                <div className="w-24 h-6 bg-white/20 rounded animate-pulse" />
                <div className="w-6 h-6 bg-white/20 rounded animate-pulse" />
              </div>

              {/* Name Skeleton */}
              <div className="space-y-4">
                <div className="w-80 h-16 bg-white/20 rounded-lg animate-pulse" />
                <div className="w-60 h-16 bg-white/20 rounded-lg animate-pulse" />
              </div>

              {/* Team Skeleton */}
              <div className="w-48 h-8 bg-white/20 rounded animate-pulse" />

              {/* Achievements Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white/20 rounded animate-pulse" />
                  <div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-white/20 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-white/20 rounded animate-pulse" />
                  <div className="w-1/2 h-4 bg-white/20 rounded animate-pulse" />
                </div>
              </div>

              {/* Button Skeleton */}
              <div className="pt-4">
                <div className="w-64 h-14 bg-white/20 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="hidden lg:flex justify-end items-center">
              <div className="relative">
                <div className="w-96 h-96 bg-white/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
        />
      </div>

      {/* Bottom Controls Skeleton */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="w-3 h-3 bg-white/20 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
          <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Counter Skeleton */}
      <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
        <div className="w-12 h-6 bg-white/20 rounded animate-pulse" />
      </div>
    </section>
  );
}
