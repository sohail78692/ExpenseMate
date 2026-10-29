'use client';

import React from 'react';
import { cn } from "@/lib/utils";

export interface KineticDotsLoaderProps {
  className?: string;
  dots?: number;
  text?: string;
}

export function KineticDotsLoader({ className, dots = 4, text }: KineticDotsLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 bg-transparent', className)}>
      <div className='flex gap-5 items-center justify-center'>
        {[...Array(dots)].map((_, i) => (
          <div
            key={i}
            className='relative flex flex-col items-center justify-end h-20 w-6'
          >
            {/* 1. THE BOUNCING DOT */}
            <div
              className='relative w-5 h-5 z-10'
              style={{
                animation: 'gravity-bounce 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                animationDelay: `${i * 0.15}s`,
                willChange: 'transform'
              }}
            >
              <div 
                className='w-full h-full rounded-full bg-gradient-to-b from-cyan-300 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                style={{
                  animation: 'rubber-morph 1.4s linear infinite',
                  animationDelay: `${i * 0.15}s`,
                  willChange: 'transform'
                }} 
              />
              
              {/* Specular highlight for liquid look */}
              <div className='absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full blur-[0.5px]' />
            </div>

            {/* 2. FLOOR RIPPLE (Shockwave on impact) */}
            <div 
               className='absolute bottom-0 w-10 h-3 border border-cyan-500/30 rounded-[100%] opacity-0'
               style={{
                 animation: 'ripple-expand 1.4s linear infinite',
                 animationDelay: `${i * 0.15}s`,
               }}
            />

            {/* 3. REFLECTIVE SHADOW */}
            <div 
              className='absolute -bottom-1 w-5 h-1.5 rounded-[100%] bg-cyan-500/40 blur-sm'
              style={{
                animation: 'shadow-breathe 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          </div>
        ))}
      </div>

      {text && (
        <p className='mt-6 text-sm sm:text-base font-semibold tracking-wide text-zinc-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-pulse text-center'>
          {text}
        </p>
      )}

      <style>{`
        /* 1. Gravity Bounce */
        @keyframes gravity-bounce {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
          50% { transform: translateY(-40px); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
          100% { transform: translateY(0); }
        }

        /* 2. Rubber Morph (Squash & Stretch) */
        @keyframes rubber-morph {
          0% { transform: scale(1.4, 0.6); }
          5% { transform: scale(0.9, 1.1); }
          15% { transform: scale(1, 1); }
          50% { transform: scale(1, 1); }
          85% { transform: scale(0.9, 1.1); }
          100% { transform: scale(1.4, 0.6); }
        }

        /* 3. Shadow Breathe */
        @keyframes shadow-breathe {
          0% { transform: scale(1.4); opacity: 0.6; }
          50% { transform: scale(0.5); opacity: 0.1; }
          100% { transform: scale(1.4); opacity: 0.6; }
        }

        /* 4. Ripple Expand */
        @keyframes ripple-expand {
          0% { transform: scale(0.5); opacity: 0; border-width: 4px; }
          5% { opacity: 0.8; }
          30% { transform: scale(1.5); opacity: 0; border-width: 0px; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default KineticDotsLoader;

