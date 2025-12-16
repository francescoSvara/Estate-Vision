'use client';

import React, { useState, useEffect } from 'react';
import { Server, Zap, Landmark, Activity, Cpu, Globe } from 'lucide-react';

type SectorType = 'datacenter' | 'utility' | 'bank' | null;

interface MapNode {
  id: SectorType;
  x: number;
  y: number;
  z: number; // Added Z-index for pseudo-3D
  label: string;
  icon: React.ReactNode;
  riskLevel: 'low' | 'medium' | 'high';
  stats: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[];
  description: string;
}

const mapNodes: MapNode[] = [
  {
    id: 'datacenter',
    x: 30,
    y: 40,
    z: 20,
    label: 'Data Center Zone A',
    icon: <Server className="w-5 h-5" />,
    riskLevel: 'low',
    stats: [
      { label: 'Power Stability', value: '99.99%', status: 'normal' },
      { label: 'Thermal Load', value: '42°C', status: 'warning' },
      { label: 'Flood Risk', value: '0.02%', status: 'normal' }
    ],
    description: "Critical infrastructure hub monitoring. Real-time thermal and power anomaly detection active."
  },
  {
    id: 'utility',
    x: 65,
    y: 25,
    z: 10,
    label: 'Regional Grid Node',
    icon: <Zap className="w-5 h-5" />,
    riskLevel: 'high',
    stats: [
      { label: 'Grid Load', value: '92%', status: 'warning' },
      { label: 'Line Integrity', value: 'Compromised', status: 'critical' },
      { label: 'Forecast', value: 'Storm Incoming', status: 'critical' }
    ],
    description: "High-voltage transmission corridor. Predictive models indicate 85% chance of outage in next 4 hours."
  },
  {
    id: 'bank',
    x: 50,
    y: 70,
    z: 30,
    label: 'FinTech HQ',
    icon: <Landmark className="w-5 h-5" />,
    riskLevel: 'medium',
    stats: [
      { label: 'Physical Security', value: 'Elevated', status: 'warning' },
      { label: 'Network Traffic', value: 'Normal', status: 'normal' },
      { label: 'Local Unrest', value: 'Detected', status: 'warning' }
    ],
    description: "Corporate headquarters asset protection. Crowd movement analysis indicates gathering protest nearby."
  }
];

export default function InteractiveMap() {
  const [activeSector, setActiveSector] = useState<SectorType>('datacenter'); 
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
     const interval = setInterval(() => {
         setRotation(r => (r + 0.1) % 360);
     }, 50);
     return () => clearInterval(interval);
  }, []);

  const activeNode = mapNodes.find(n => n.id === activeSector);

  return (
    <div className="relative w-full min-h-[800px] bg-[#020203] overflow-hidden border-b border-white/10 flex flex-col md:flex-row">
      
      {/* 3D Scene Container */}
      <div className="flex-1 relative h-[600px] md:h-auto perspective-1000 overflow-hidden">
          
          {/* Ambient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>

          {/* Rotating Map Plane */}
          <div 
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] transform-style-3d transition-transform duration-700 ease-out"
            style={{ 
                transform: `translate(-50%, -50%) rotateX(60deg) rotateZ(${rotation}deg)`,
            }}
          >
             {/* Map Grid Base */}
             <div className="absolute inset-0 border border-blue-500/20 rounded-full bg-blue-900/5 holo-glow"></div>
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div> 
             
             {/* Concentric Rings */}
             <div className="absolute inset-[10%] border border-blue-500/10 rounded-full animate-pulse"></div>
             <div className="absolute inset-[30%] border border-dashed border-blue-500/20 rounded-full"></div>

             {/* Nodes */}
             {mapNodes.map((node) => {
                 // Calculate counter-rotation to keep icons upright relative to the screen is tricky in pure CSS with complex parent transforms.
                 // Instead, we use billboards or simply let them rotate with the map but keep them legible.
                 // For this effect, we will simply place them on the plane.
                 return (
                    <button
                        key={node.id}
                        onClick={() => setActiveSector(node.id)}
                        style={{ 
                            left: `${node.x}%`, 
                            top: `${node.y}%`,
                            transform: `translate(-50%, -50%) translateZ(${activeSector === node.id ? 50 : 0}px)` // Lift active node
                        }}
                        className="absolute group transition-all duration-500 preserve-3d"
                    >
                        {/* Vertical Line to Ground */}
                        <div className={`absolute bottom-0 left-1/2 w-[1px] bg-blue-500/50 origin-bottom transition-all duration-500 ${activeSector === node.id ? 'h-[50px]' : 'h-0'}`}></div>

                        {/* Node Marker */}
                        <div className={`relative transform -rotate-x-60 rotate-z-[-${rotation}deg] transition-transform duration-75`}> {/* Counter-rotate to face camera somewhat */}
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-md transition-all duration-300
                                ${activeSector === node.id 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-125' 
                                : 'bg-black/80 border-white/20 text-gray-400 hover:bg-blue-900/50 hover:border-blue-400/50'}
                             `}>
                                {node.icon}
                             </div>
                             
                             {/* Ping Effect */}
                             {activeSector === node.id && (
                                 <div className="absolute inset-0 rounded-full bg-blue-500/50 animate-ping-slow -z-10"></div>
                             )}
                        </div>
                    </button>
                 );
             })}
          </div>
          
          {/* Overlay UI Elements (HUD) */}
          <div className="absolute bottom-10 left-10 text-xs font-mono text-blue-500/50 pointer-events-none">
              <div>COORD: 34.0522° N, 118.2437° W</div>
              <div>GRID STATUS: ACTIVE</div>
              <div>SCANNING...</div>
          </div>
      </div>

      {/* Intelligence Panel (Right Side) */}
      <div className="relative w-full md:w-[450px] bg-black/40 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col z-20">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
         
         {activeNode ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-400">
                        {activeNode.icon}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{activeNode.label}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeNode.riskLevel === 'high' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeNode.riskLevel === 'high' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                            </span>
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Live Signal</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {activeNode.stats.map((stat, idx) => (
                        <div key={idx} className="group relative bg-white/5 border border-white/5 p-4 hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
                            <div className="absolute inset-0 bg-blue-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
                            <div className="relative flex justify-between items-center">
                                <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                                <span className={`text-base font-mono font-bold ${stat.status === 'critical' ? 'text-red-500' : stat.status === 'warning' ? 'text-yellow-500' : 'text-blue-400'}`}>
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Analysis Block */}
                <div className="flex-1">
                    <div className="p-5 bg-blue-900/10 border border-blue-500/20 rounded-lg relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-20">
                             <Activity className="w-12 h-12 text-blue-500" />
                         </div>
                         <h4 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center">
                            <Cpu className="w-4 h-4 mr-2" /> Intelligence Assessment
                         </h4>
                         <p className="text-sm text-gray-300 leading-relaxed">
                            {activeNode.description}
                         </p>
                    </div>
                </div>
                
                {/* Action */}
                <button className="mt-8 w-full py-4 bg-white hover:bg-gray-200 text-black font-bold tracking-widest uppercase text-sm transition-colors flex items-center justify-center">
                    <span>Access Full Telemetry</span>
                    <div className="ml-2 w-2 h-2 bg-black rounded-full"></div>
                </button>
            </div>
         ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <Globe className="w-12 h-12 mb-4 opacity-20" />
                 <p>Select a node to initialize stream</p>
             </div>
         )}
      </div>
    </div>
  );
}
