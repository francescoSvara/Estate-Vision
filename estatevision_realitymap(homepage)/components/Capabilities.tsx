import React from 'react';
import { Shield, Zap, Map, BarChart, AlertTriangle, GitBranch } from 'lucide-react';

export default function Capabilities() {
  const capabilities = [
    {
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      title: "Real-Time Physical Risk Monitoring",
      description: "Continuous surveillance of physical threats across global assets."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Predictive Outage & Disruption Forecasting",
      description: "AI-driven models to anticipate grid failures and supply chain breaks."
    },
    {
      icon: <Map className="w-6 h-6 text-green-400" />,
      title: "Regulatory Intelligence Mapping",
      description: "Geospatial tracking of changing compliance and zoning laws."
    },
    {
      icon: <BarChart className="w-6 h-6 text-indigo-400" />,
      title: "Infrastructure Vulnerability Scoring",
      description: "Dynamic risk scores for buildings, grids, and critical networks."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      title: "Incident & Anomaly Detection",
      description: "Immediate identification of irregular patterns in physical data."
    },
    {
      icon: <GitBranch className="w-6 h-6 text-purple-400" />,
      title: "Scenario Modeling & Impact Analysis",
      description: "Simulate complex disaster scenarios to test resilience strategies."
    }
  ];

  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Platform Capabilities</h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="group relative bg-white/5 p-8 border border-white/5 hover:border-transparent transition-all duration-300 corner-border">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="mb-6 p-2 inline-block bg-black border border-white/10 group-hover:border-blue-500/50 transition-colors rounded">
                  {cap.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{cap.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{cap.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
