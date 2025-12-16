import React from 'react';
import { Server, Zap, Landmark, Building2 } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      title: "Data Centers",
      description: "Site selection, operational continuity, resilience scouting.",
      icon: <Server className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Utilities & Energy",
      description: "Outage risks, grid intelligence, asset monitoring.",
      icon: <Zap className="w-6 h-6 text-yellow-400" />
    },
    {
      title: "Banks & Insurers",
      description: "Asset risk scoring, underwriting intelligence, exposure modeling.",
      icon: <Landmark className="w-6 h-6 text-green-400" />
    },
    {
      title: "Governments",
      description: "Territory monitoring, planning, crisis awareness.",
      icon: <Building2 className="w-6 h-6 text-purple-400" />
    }
  ];

  return (
    <section className="py-24 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Strategic Applications</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((item, idx) => (
            <div key={idx} className="p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-lg">
              <div className="mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
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

