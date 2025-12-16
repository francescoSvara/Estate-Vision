import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-32 bg-black border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_70%)]"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                Operational Intelligence starts here.
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button className="px-8 py-4 bg-white text-black font-bold tracking-wide uppercase hover:bg-gray-200 transition-colors w-full sm:w-auto">
                    Request Access
                </button>
                <button className="px-8 py-4 border border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-wide transition-colors flex items-center w-full sm:w-auto justify-center">
                    Contact Sales <ArrowRight className="ml-2 w-4 h-4" />
                </button>
            </div>
            
            <p className="mt-12 text-gray-500 text-sm font-mono">
                RESTRICTED ACCESS // VETTED ORGANIZATIONS ONLY
            </p>
        </div>
    </section>
  );
}

