'use client';
import React, { useState } from 'react';
import { 
    Filter, Map as MapIcon, BarChart2, AlertTriangle, 
    Eye, Activity, Search, Globe, Zap, 
    Wind, Shield, Radio, Terminal, Layers,
    Camera, Lock, Navigation, Maximize, ChevronDown,
    CheckCircle2, Circle, ArrowRight, Share2, MoreHorizontal
} from 'lucide-react';
import DashboardCityScene from './DashboardCityScene';

export default function InterfacePreview() {
  return (
    <section className="py-32 bg-[#02040A] relative overflow-hidden border-t border-white/5">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
             <div className="inline-flex items-center text-blue-500 font-mono text-xs tracking-widest uppercase mb-4 border border-blue-500/30 px-3 py-1 rounded bg-blue-500/5">
                <Terminal className="w-3 h-3 mr-2" /> EstateVision OS v2.4
             </div>
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                 Unified Risk Operating System
             </h2>
             <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                 Ingest signals from any domain. Predict threats in real-time. Coordinate response from a single pane of glass.
             </p>
        </div>

        {/* Dashboard Container - Maximized for Map View */}
        <div className="max-w-[1400px] mx-auto px-4">
            <div className="relative bg-[#111111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex h-[800px]">
                
                {/* LEFT SIDEBAR: Search & Navigation (Floating over map style or sidebar) */}
                <div className="w-80 bg-[#0a0a0a] border-r border-gray-800 flex flex-col shrink-0 z-10">
                    
                    {/* App Header */}
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                                <span className="font-bold text-white text-xs">EV</span>
                            </div>
                            <span className="font-bold text-white text-sm">EstateVision</span>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </div>

                    {/* Search Area */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search assets, sensors, coordinates..." 
                                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-9 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filter Categories */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                         <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Risk Vectors</div>
                         
                         <div className="flex items-center space-x-2 px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer group">
                             <div className="w-2 h-2 rounded-full bg-red-500"></div>
                             <span className="text-xs text-gray-300 group-hover:text-white flex-1">Critical</span>
                             <span className="text-[10px] text-gray-600">3</span>
                         </div>
                         <div className="flex items-center space-x-2 px-3 py-2 bg-[#1a1a1a] rounded cursor-pointer group border-l-2 border-orange-500">
                             <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                             <span className="text-xs text-white flex-1 font-bold">Warning</span>
                             <span className="text-[10px] text-gray-400">12</span>
                         </div>
                         <div className="flex items-center space-x-2 px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer group">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             <span className="text-xs text-gray-300 group-hover:text-white flex-1">Monitoring</span>
                             <span className="text-[10px] text-gray-600">84</span>
                         </div>
                         <div className="flex items-center space-x-2 px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer group">
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                             <span className="text-xs text-gray-300 group-hover:text-white flex-1">Stable</span>
                             <span className="text-[10px] text-gray-600">1,204</span>
                         </div>

                         <div className="mt-6 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Intelligence Layers</div>
                         <div className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer text-gray-400 hover:text-white">
                             <div className="flex items-center space-x-2">
                                 <Shield className="w-3 h-3" />
                                 <span className="text-xs">Physical Security</span>
                             </div>
                             <div className="w-8 h-4 bg-gray-700 rounded-full relative">
                                 <div className="w-2 h-2 bg-white rounded-full absolute left-1 top-1"></div>
                             </div>
                         </div>
                         <div className="flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer text-gray-400 hover:text-white">
                             <div className="flex items-center space-x-2">
                                 <Zap className="w-3 h-3" />
                                 <span className="text-xs">Grid Infrastructure</span>
                             </div>
                             <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                                 <div className="w-2 h-2 bg-white rounded-full absolute right-1 top-1"></div>
                             </div>
                         </div>
                    </div>

                    {/* Bottom User Profile */}
                    <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                            <div>
                                <div className="text-xs font-bold text-white">Admin User</div>
                                <div className="text-[10px] text-gray-500">EstateVision Command</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER PANE: 3D Map */}
                <div className="flex-1 relative bg-[#111111] overflow-hidden">
                    
                    {/* Top Controls Overlay */}
                    <div className="absolute top-4 right-4 z-10 flex space-x-2">
                        <button className="bg-black/80 backdrop-blur border border-gray-700 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center hover:bg-gray-800 transition-colors">
                            <Share2 className="w-3 h-3 mr-2" /> Share View
                        </button>
                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-500 transition-colors">
                            Generate Report
                        </button>
                    </div>

                    {/* The 3D Scene */}
                    <DashboardCityScene />

                    {/* Bottom Left Legend Overlay */}
                    <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                         <div className="bg-black/80 backdrop-blur border border-gray-800 p-3 rounded shadow-lg pointer-events-auto">
                             <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Threat Analysis</div>
                             <div className="space-y-1.5">
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                     <span className="text-[10px] text-gray-300">Critical <span className="text-gray-500 ml-1">3</span></span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                     <span className="text-[10px] text-gray-300">Warning <span className="text-gray-500 ml-1">12</span></span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                     <span className="text-[10px] text-gray-300">Monitoring <span className="text-gray-500 ml-1">84</span></span>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                     <span className="text-[10px] text-gray-300">Stable <span className="text-gray-500 ml-1">1,204</span></span>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Bottom Right: Attribution */}
                    <div className="absolute bottom-2 right-2 text-[9px] text-gray-600 font-mono pointer-events-none z-10">
                        © OpenStreetMap contributors | © EstateVision
                    </div>
                </div>

            </div>
        </div>
    </section>
  );
}
