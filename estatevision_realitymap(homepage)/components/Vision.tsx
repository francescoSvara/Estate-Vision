import React from 'react';

export default function Vision() {
  return (
    <section className="py-32 bg-[#030305] border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tighter leading-tight">
          The Next Decade is <span className="text-blue-500">Physical</span>.
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
          As real-world instability accelerates, the need for a unified intelligence layer becomes critical. 
          EstateVision serves as the <span className="text-white font-medium">digital nervous system</span> of the built environment, turning predictive capability into a competitive advantage and security necessity.
        </p>
      </div>
    </section>
  );
}

