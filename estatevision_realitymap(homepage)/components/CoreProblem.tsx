import React from 'react';
import { Database, Activity, EyeOff, AlertCircle } from 'lucide-react';

export default function CoreProblem() {
  const problems = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "DATA FRAGMENTATION",
      status: "CRITICAL",
      description: "Siloed signals create intelligence gaps."
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "VOLATILITY SPIKE",
      status: "ELEVATED",
      description: "Cyber-physical threats accelerating."
    },
    {
      icon: <EyeOff className="w-6 h-6" />,
      title: "BLIND SPOTS",
      status: "DETECTED",
      description: "Reactive posture leads to failure."
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Connecting Line from Spine */}
      <div className="absolute left-1/2 top-0 h-32 w-[1px] bg-gradient-to-b from-transparent to-red-500/50 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header - Asymmetric */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b border-white/10 pb-6">
           <div className="max-w-2xl">
                <div className="flex items-center text-red-500 mb-4">
                    <AlertCircle className="w-5 h-5 mr-2 animate-pulse" />
                    <span className="font-mono text-xs tracking-widest uppercase">System Diagnostic: Warning</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                    THE PHYSICAL WORLD IS <br/> <span className="text-red-500">UNPREDICTABLE</span>
                </h2>
           </div>
           <div className="hidden md:block font-mono text-xs text-gray-500 text-right">
               <div>ERR_CODE: 0x84F</div>
               <div>LATENCY: HIGH</div>
           </div>
        </div>
        
        {/* Problem Nodes connected to center */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Horizontal Connection Line (Visual only) */}
           <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px] bg-white/10 z-0"></div>

           {problems.map((item, index) => (
            <div key={index} className="relative z-10 bg-black border border-red-900/30 p-6 group hover:border-red-500 transition-colors duration-300">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-red-950/30 rounded text-red-500 border border-red-900/50">
                    {item.icon}
                 </div>
                 <span className="text-xs font-mono text-red-500 border border-red-900/50 px-2 py-1 rounded animate-pulse">
                    {item.status}
                 </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 tracking-wide">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
