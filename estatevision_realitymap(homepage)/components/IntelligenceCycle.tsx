import React from 'react';
import { Layers, Cpu, Radio, Search, Globe } from 'lucide-react';

export default function IntelligenceCycle() {
  const steps = [
    {
      id: "01",
      title: "Collection",
      description: "Ingest real-world signals from 1000+ sources",
      icon: <Radio className="w-6 h-6" />
    },
    {
      id: "02",
      title: "Normalization",
      description: "Convert disparate formats into unified ontologies",
      icon: <Layers className="w-6 h-6" />
    },
    {
      id: "03",
      title: "Analysis",
      description: "Correlation, anomaly detection, cross-domain reasoning",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      id: "04",
      title: "Forecasting",
      description: "Predictive models and impact simulations",
      icon: <Search className="w-6 h-6" />
    },
    {
      id: "05",
      title: "Delivery",
      description: "Dashboards, APIs, alerts, enterprise integrations",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-24 bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Intelligence Cycle</h2>
          <p className="text-gray-400">Automated pipeline from raw signal to decision advantage</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gradient-to-r from-blue-900/20 via-blue-500/50 to-blue-900/20 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="w-24 h-24 mx-auto bg-black border border-blue-500/30 rounded-full flex items-center justify-center mb-6 group-hover:border-blue-400 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                   <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                     {step.icon}
                   </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-mono text-blue-500 mb-2 opacity-70">{step.id}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed px-2">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

