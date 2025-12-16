'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProblemSection() {
  return (
    <section className="py-32 bg-[#02040A] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
            
            {/* Section Header */}
            <div className="mb-24 text-center">
                 <div className="inline-flex items-center text-red-500 font-mono text-xs tracking-widest uppercase mb-6 border border-red-500/30 px-3 py-1 rounded bg-red-500/5">
                    <AlertTriangle className="w-3 h-3 mr-2" /> System Diagnostic: Critical
                 </div>
                     <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                        THE PHYSICAL WORLD IS <br/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">BECOMING UNPREDICTABLE</span>
                     </h2>
            </div>

            {/* 3-Column Grid */}
            <div className="grid md:grid-cols-3 gap-12 relative">
                
                {/* Connecting Line (Desktop) */}
                <div className="absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block"></div>

                {/* 1. Fragmented Intelligence */}
                <div className="relative group">
                    <div className="w-24 h-24 mx-auto bg-[#050505] border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:border-blue-500/50 transition-colors relative z-10">
                        <div className="w-12 h-12 relative">
                            {/* Icon: Disconnected Nodes */}
                            <div className="absolute top-0 left-0 w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full opacity-50"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                            <svg className="absolute inset-0 w-full h-full">
                                <line x1="20%" y1="20%" x2="40%" y2="40%" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" />
                                <line x1="80%" y1="80%" x2="60%" y2="60%" stroke="white" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="2 2" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-center px-4">
                        <h3 className="text-xl font-bold text-white mb-4">Fragmented Intelligence</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Critical infrastructure data is siloed across disconnected legacy systems, leaving decision-makers blind to cascading risks until it's too late.
                        </p>
                    </div>
                </div>

                {/* 2. Accelerating Volatility */}
                <div className="relative group">
                    <div className="w-24 h-24 mx-auto bg-[#050505] border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:border-red-500/50 transition-colors relative z-10">
                        <div className="w-12 h-12 flex items-center justify-center">
                            {/* Icon: Chaotic Wave */}
                            <svg viewBox="0 0 50 30" className="w-10 h-6">
                                <path d="M0,15 L10,15 L15,5 L25,25 L35,10 L40,15 L50,15" fill="none" stroke="#ef4444" strokeWidth="2" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-center px-4">
                        <h3 className="text-xl font-bold text-white mb-4">Accelerating Volatility</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            From climate-induced grid failures to geopolitical supply chain shocks, the frequency of 'black swan' events is increasing exponentially.
                        </p>
                    </div>
                </div>

                {/* 3. Reactive Posture */}
                <div className="relative group">
                    <div className="w-24 h-24 mx-auto bg-[#050505] border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:border-yellow-500/50 transition-colors relative z-10">
                        <div className="w-12 h-12 relative flex items-center justify-center">
                            {/* Icon: Late Shield */}
                            <div className="absolute w-8 h-8 border-2 border-white/20 rounded-full"></div>
                            <div className="absolute w-8 h-8 border-t-2 border-r-2 border-yellow-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="text-center px-4">
                        <h3 className="text-xl font-bold text-white mb-4">Reactive Posture</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Institutions are stuck in reactive loops, responding to incidents after impact rather than forecasting and mitigating them proactively.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
}
