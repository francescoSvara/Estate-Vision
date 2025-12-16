import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Solution() {
  return (
    <section className="py-32 relative bg-[#050505] border-y border-white/5 overflow-hidden">
      
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 bg-grid opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left: The Narrative */}
            <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 border border-blue-500/30 rounded-full bg-blue-900/10 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-xs font-mono text-blue-400 tracking-widest uppercase">Intelligence Layer Active</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                  UNIFIED <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PHYSICAL INTELLIGENCE</span>
                </h2>
                
                <p className="text-xl text-gray-400 leading-relaxed mb-10">
                    EstateVision ingests chaos and outputs clarity. We map the interdependencies between energy, infrastructure, and regulatory shifts to predict risks before they manifest.
                </p>

                <button className="group flex items-center space-x-4 text-white font-bold tracking-wide hover:text-blue-400 transition-colors">
                    <span>EXPLORE THE PLATFORM</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
                </button>
            </div>

            {/* Right: The System Visual */}
            <div className="relative">
                {/* Pseudo-3D Stack */}
                <div className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-xl p-8 rounded-lg transform md:rotate-y-12 md:rotate-x-6 transition-transform duration-500 hover:transform-none shadow-2xl">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                        <span className="text-sm font-mono text-gray-500">SYSTEM_STATUS</span>
                        <span className="text-xs font-mono text-green-400 px-2 py-1 bg-green-900/20 rounded">OPTIMAL</span>
                    </div>
                    
                    <div className="space-y-6">
                         {[
                            "Unified Data Ingestion",
                            "Cross-Domain Correlation",
                            "Predictive Modeling Engine",
                            "Global Asset Registry"
                         ].map((item, idx) => (
                             <div key={idx} className="flex items-center group cursor-default">
                                 <div className="mr-4 p-1 rounded-full border border-blue-500/30 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                     <CheckCircle2 className="w-4 h-4" />
                                 </div>
                                 <span className="text-lg text-gray-300 group-hover:text-white transition-colors">{item}</span>
                                 <div className="ml-auto w-12 h-[1px] bg-white/10 group-hover:bg-blue-500/50 transition-colors"></div>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Backing Elements for Depth */}
                <div className="absolute top-4 -right-4 w-full h-full border border-white/5 bg-white/5 z-0 rounded-lg hidden md:block"></div>
                <div className="absolute -top-4 -left-4 w-full h-full border border-dashed border-white/10 z-0 rounded-lg hidden md:block"></div>
            </div>
        </div>
      </div>
    </section>
  );
}
