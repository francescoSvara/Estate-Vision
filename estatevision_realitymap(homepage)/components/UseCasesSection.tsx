import React from 'react';
import { Building2, Zap, Landmark } from 'lucide-react';

export default function UseCasesSection() {
  const useCases = [
    {
        category: "Governments & Defense",
        icon: <Building2 className="w-5 h-5" />,
        items: [
            "Territory stability monitoring",
            "Critical infrastructure protection",
            "Crisis response coordination"
        ]
    },
    {
        category: "Utilities & Energy",
        icon: <Zap className="w-5 h-5" />,
        items: [
            "Grid resilience forecasting",
            "Asset vulnerability scoring",
            "Outage prediction models"
        ]
    },
    {
        category: "Financial Institutions",
        icon: <Landmark className="w-5 h-5" />,
        items: [
            "Physical risk underwriting",
            "Portfolio exposure analysis",
            "Sovereign risk intelligence"
        ]
    }
  ];

  return (
    <section className="py-32 bg-[#02040A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-white mb-2">Strategic Applications</h2>
                <p className="text-gray-400">Operational intelligence for high-stakes environments.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
                {useCases.map((uc, idx) => (
                    <div key={idx} className="bg-[#02040A] p-8 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center space-x-3 mb-6 text-blue-400">
                            {uc.icon}
                            <h3 className="font-bold text-white tracking-wide uppercase text-sm">{uc.category}</h3>
                        </div>
                        
                        <ul className="space-y-4">
                            {uc.items.map((item, i) => (
                                <li key={i} className="flex items-start text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                                    <span className="mr-2 text-blue-500/50">/</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-dashed border-white/10 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-mono text-gray-500">SEC_LEVEL_{idx + 1}</span>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}

