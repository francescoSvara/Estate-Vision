'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { X, AlertTriangle } from 'lucide-react';

// 3D Building Component
function MapBuilding({ position, scale, color, type, onHover }: { position: [number, number, number], scale: [number, number, number], color: string, type: 'risk' | 'safe' | 'normal', onHover?: (hover: boolean) => void }) {
  return (
    <group position={position}>
        <Box 
            args={[1, 1, 1]} 
            scale={scale}
            onPointerOver={() => onHover && onHover(true)}
            onPointerOut={() => onHover && onHover(false)}
        >
            <meshStandardMaterial 
                color={color} 
                roughness={0.3} 
                metalness={0.2}
                transparent 
                opacity={type === 'normal' ? 0.4 : 0.7} 
            />
        </Box>
        <lineSegments scale={scale}>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial color={type === 'normal' ? "#334155" : color} transparent opacity={0.3} />
        </lineSegments>
        
        {type === 'risk' && (
            <mesh position={[0, scale[1]/2 + 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[scale[0] * 0.8, scale[2] * 0.8]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.4} />
            </mesh>
        )}
    </group>
  );
}

function StreetLabel({ position, text, rotation = [-Math.PI/2, 0, 0] }: { position: [number, number, number], text: string, rotation?: [number, number, number] }) {
    return (
        <Text 
            position={position} 
            rotation={rotation} 
            fontSize={0.4} 
            color="#475569" 
            anchorX="center" 
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
            {text}
        </Text>
    )
}

function MiniLabel({ position, label, color }: { position: [number, number, number], label: string, color: string }) {
    return (
        <Html position={position} distanceFactor={15} zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`flex items-center space-x-2 px-2 py-1 bg-black/60 backdrop-blur-sm border border-${color}-500/30 rounded-full shadow-lg`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`}></div>
                <span className={`text-[8px] font-mono font-bold text-${color}-400 whitespace-nowrap uppercase tracking-wider`}>{label}</span>
            </div>
        </Html>
    )
}

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Generate City Grid
  const buildings = useMemo(() => {
      const items = [];
      const gridSize = 16; 
      
      for(let x = -gridSize; x <= gridSize; x++) {
          for(let z = -gridSize; z <= gridSize; z++) {
              
              if (Math.abs(x) === 5 || Math.abs(x) === 0 || Math.abs(x) === 10) continue;
              if (Math.abs(z) === 5 || Math.abs(z) === 0 || Math.abs(z) === 10) continue;
              if (Math.random() > 0.85) continue;

              const distToCenter = Math.sqrt(x*x + z*z);
              let type: 'risk' | 'safe' | 'normal' = 'normal';
              let color = '#334155'; 
              
              if (distToCenter < 4) {
                  type = 'risk';
                  color = '#f87171'; 
              } else if (distToCenter < 12 && Math.random() > 0.4) {
                  type = 'safe';
                  color = '#60a5fa'; 
              }

              let height = Math.random() * 4 + 1;
              if (type === 'risk') height += 2;
              if (type === 'safe') height += 1;

              items.push({
                  position: [x, height/2, z] as [number, number, number],
                  scale: [0.85, height, 0.85] as [number, number, number],
                  color,
                  type
              });
          }
      }
      return items;
  }, []);

  useFrame(() => {
      if(groupRef.current && !isHovered) {
         groupRef.current.rotation.y += 0.0005; 
      }
  })

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
        
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.01, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#0f172a" /> 
        </mesh>

        <gridHelper args={[100, 100, 0x334155, 0x1e293b]} position={[0, 0.01, 0]} />

        {buildings.map((b, i) => (
            <MapBuilding 
                key={i} 
                position={b.position} 
                scale={b.scale} 
                color={b.color} 
                type={b.type}
                onHover={b.type === 'risk' ? setIsHovered : undefined} 
            />
        ))}

        <group position={[0, 0.1, 0]}>
             <StreetLabel position={[0, 0, 5]} text="SECTOR A" />
             <StreetLabel position={[0, 0, 10]} text="PERIMETER RD" />
             <StreetLabel position={[0, 0, -5]} text="ACCESS WAY" />
             <StreetLabel position={[5, 0, 0]} text="GRID LINE 1" rotation={[-Math.PI/2, 0, Math.PI/2]} />
             <StreetLabel position={[10, 0, 0]} text="MAIN FEED" rotation={[-Math.PI/2, 0, Math.PI/2]} />
             <StreetLabel position={[-5, 0, 0]} text="SERVICE LN" rotation={[-Math.PI/2, 0, Math.PI/2]} />
        </group>

        <MiniLabel position={[6, 3, -6]} label="SENSOR: ONLINE" color="emerald" />
        <MiniLabel position={[-6, 2, 6]} label="GRID: STABLE" color="blue" />
        <MiniLabel position={[8, 1, 8]} label="PATROL: ACTIVE" color="amber" />
        <MiniLabel position={[-4, 4, -4]} label="UPLINK: SECURE" color="cyan" />

        <group position={[0, 0.05, 0]}>
             <mesh rotation={[-Math.PI/2, 0, 0]}>
                 <ringGeometry args={[3.5, 3.6, 64]} />
                 <meshBasicMaterial color="#f87171" transparent opacity={0.5} />
             </mesh>
             <mesh rotation={[-Math.PI/2, 0, 0]}>
                 <ringGeometry args={[3.5, 10, 64]} />
                 <meshBasicMaterial color="#f87171" transparent opacity={0.05} />
             </mesh>
        </group>

        {/* Compact, Interactive UI Card */}
        <Html position={[1, 6, 1]} distanceFactor={35} zIndexRange={[100, 0]}>
            <div className={`transition-all duration-300 ${isExpanded ? 'w-40' : 'w-8 h-8 rounded-full'} bg-black/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden font-sans text-left relative group`}>
                
                {/* Minimized State - Pulse Icon */}
                {!isExpanded && (
                    <div 
                        className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/10"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
                    </div>
                )}

                {/* Expanded Content */}
                {isExpanded && (
                    <>
                        {/* Header */}
                        <div className="p-2 border-b border-white/10 flex items-center justify-between bg-red-500/5">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-white text-[8px] tracking-widest uppercase">Sovereign Bank</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={10} />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-2 space-y-2">
                            
                            {/* Critical Alert - Minimal */}
                            <div className="flex items-start gap-1.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[8px] text-red-400 font-bold uppercase leading-none mb-0.5">Breach Detected</div>
                                    <div className="text-[7px] text-gray-500 leading-tight">Zone 4 (North)</div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-1">
                                <div className="bg-white/5 p-1 rounded border border-white/5 text-center">
                                    <div className="text-[6px] text-gray-500 uppercase tracking-wide">Vault</div>
                                    <div className="text-[8px] text-emerald-400 font-mono">SECURE</div>
                                </div>
                                <div className="bg-white/5 p-1 rounded border border-white/5 text-center">
                                    <div className="text-[6px] text-gray-500 uppercase tracking-wide">Risk</div>
                                    <div className="text-[8px] text-red-400 font-mono font-bold">94/100</div>
                                </div>
                            </div>

                            {/* Intelligence Status (No Button) */}
                            <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded py-1 flex items-center justify-center space-x-1.5">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-[7px] text-blue-300 font-mono uppercase tracking-wider">Live Intelligence</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Html>

    </group>
  );
}

export default function DashboardCityScene() {
  return (
    <div className="w-full h-full absolute inset-0 bg-[#0f172a]"> 
      <Canvas camera={{ position: [15, 15, 15], fov: 30 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[-10, 20, -5]} intensity={0.8} color="#ffffff" />
        <pointLight position={[5, 10, 5]} intensity={0.3} color="#f87171" distance={30} />
        
        <SceneContent />
        
        <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
