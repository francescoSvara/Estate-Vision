'use client';
import React from 'react';

export default function DataStream() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 hidden md:block">
      {/* Central Data Spine */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 -translate-x-1/2">
          {/* Flowing Data Particle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[100px] bg-gradient-to-b from-transparent via-blue-500 to-transparent animate-scan" style={{ animationDuration: '3s' }}></div>
          
          {/* Second Particle delayed */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[100px] bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-scan" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
      </div>

      {/* Left/Right Guide Lines */}
      <div className="absolute left-12 top-0 bottom-0 w-[1px] bg-white/5 hidden xl:block"></div>
      <div className="absolute right-12 top-0 bottom-0 w-[1px] bg-white/5 hidden xl:block"></div>
    </div>
  );
}

