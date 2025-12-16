import React from 'react';
import AssetScene from './AssetScene';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen w-full bg-[#02040A] overflow-hidden flex flex-col justify-center">
        
        {/* Background Grid - Reduced Opacity */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
        
        {/* 3D Scene Container - Strictly aligned to right 60% on desktop */}
        <div className="absolute top-0 right-0 w-full h-full lg:w-[60%] z-0 pointer-events-auto">
            <AssetScene />
            {/* Fade gradient to blend the left edge of the canvas into the text area */}
            <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-[#02040A] to-transparent pointer-events-none"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full pt-20 flex items-center pointer-events-none">
            
            {/* Left Column: Text - Pointer events auto to allow interaction with buttons */}
            <div className="w-full lg:w-1/2 pointer-events-auto pr-0 lg:pr-12">
                <div className="inline-flex items-center space-x-2 mb-6 px-3 py-1 border border-blue-500/30 bg-blue-900/10 backdrop-blur-sm rounded-full">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-mono text-blue-400 tracking-[0.2em] uppercase">Asset Intelligence Online</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-8">
                    PREDICT THE <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">PHYSICAL WORLD</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                    EstateVision unifies fragmented infrastructure data into a real-time intelligence layer. Forecast security risks, grid volatility, and asset vulnerabilities before they escalate.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <button className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wider uppercase transition-all overflow-hidden cursor-pointer">
                        <span className="relative z-10 flex items-center">
                            Request Access <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    
                    <button className="group px-8 py-4 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-mono uppercase text-sm tracking-wider transition-all backdrop-blur-sm bg-black/20 cursor-pointer">
                        Schedule Briefing
                    </button>
                </div>

                {/* Metrics Console */}
                <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-3 gap-8 backdrop-blur-sm bg-black/20 p-4 rounded-lg border border-white/5">
                    <div>
                        <div className="text-2xl font-mono font-bold text-white mb-1">142</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Countries Monitored</div>
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-blue-400 mb-1">8.4M</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Assets Tracked</div>
                    </div>
                    <div>
                        <div className="text-2xl font-mono font-bold text-teal-400 mb-1">99.9%</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Uptime Guarantee</div>
                    </div>
                </div>
            </div>
            
            {/* Right Column Spacer - Implies the space for the 3D element */}
            <div className="hidden lg:block lg:w-1/2 h-full pointer-events-none relative">
                 {/* Decorative HUD Elements */}
                 <div className="absolute top-1/4 right-0 w-64 h-64 border-t border-r border-white/10 rounded-tr-3xl opacity-50"></div>
                 <div className="absolute bottom-1/4 right-10 w-px h-32 bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-50"></div>
                 
                 {/* Floating Context Label for the Scene */}
                 <div className="absolute top-1/2 right-0 transform translate-x-1/2 -rotate-90 origin-left">
                     <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Live Simulation // Asset_ID: 8992</span>
                 </div>
            </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#02040A] to-transparent pointer-events-none"></div>
    </section>
  );
}
