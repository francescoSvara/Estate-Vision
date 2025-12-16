'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Html, Line, Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// --- Realistic Components ---

function ConcreteBuilding({ position, scale, color = "#64748b", windows = false }: { position: [number, number, number], scale: [number, number, number], color?: string, windows?: boolean }) {
  return (
    <group position={position}>
        {/* Main Structure - Darker base color */}
        <Box args={[1, 1, 1]} scale={scale}>
            <meshStandardMaterial 
                color={color} 
                roughness={0.9}
                metalness={0.1}
            />
        </Box>
        
        {/* Window Strips (if enabled) - Less intense emission */}
        {windows && Array.from({ length: Math.floor(scale[1] * 1.5) }).map((_, i) => (
             <Box 
                key={i} 
                args={[scale[0] + 0.02, 0.2, scale[2] + 0.02]} 
                position={[0, -scale[1]/2 + 0.8 + i * 0.6, 0]}
             >
                 <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} emissive="#1e293b" emissiveIntensity={0.1} />
             </Box>
        ))}
    </group>
  );
}

function SubstationUnit({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Transformer Body */}
            <Box args={[0.8, 0.6, 0.6]} position={[0, 0.3, 0]}>
                 <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.3} />
            </Box>
            {/* Cooling Fins */}
            <Box args={[0.9, 0.4, 0.4]} position={[0, 0.3, 0]}>
                 <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.4} />
            </Box>
            {/* Bushings */}
            <Cylinder args={[0.05, 0.05, 0.4]} position={[-0.2, 0.7, 0]} rotation={[0,0,0]}>
                 <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </Cylinder>
            <Cylinder args={[0.05, 0.05, 0.4]} position={[0.2, 0.7, 0]} rotation={[0,0,0]}>
                 <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </Cylinder>
        </group>
    )
}

function RealisticRoad({ position, length, rotation = [0, 0, 0] }: { position: [number, number, number], length: number, rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Asphalt */}
            <Box args={[length, 0.05, 2]} position={[0, 0, 0]}>
                 <meshStandardMaterial color="#0f172a" roughness={1} />
            </Box>
            {/* Yellow Lines */}
            <Box args={[length, 0.06, 0.05]} position={[0, 0, 0]}>
                 <meshBasicMaterial color="#b45309" />
            </Box>
            {/* White Lines */}
            <Box args={[length, 0.06, 0.1]} position={[0, 0, 0.9]}>
                 <meshBasicMaterial color="#64748b" />
            </Box>
            <Box args={[length, 0.06, 0.1]} position={[0, 0, -0.9]}>
                 <meshBasicMaterial color="#64748b" />
            </Box>
            <TrafficFlow length={length} />
        </group>
    )
}

function TrafficFlow({ length }: { length: number }) {
    const count = 8;
    const dots = useMemo(() => new Array(count).fill(0).map(() => ({
        offset: Math.random() * length - length/2,
        speed: Math.random() * 0.05 + 0.02,
        lane: Math.random() > 0.5 ? 0.5 : -0.5
    })), [length]);

    const ref = useRef<THREE.Group>(null!);

    useFrame(() => {
        if(ref.current) {
            ref.current.children.forEach((child: any, i) => {
                let dot = dots[i];
                child.position.x += dot.speed;
                if(child.position.x > length/2) child.position.x = -length/2;
            })
        }
    });

    return (
        <group ref={ref}>
            {dots.map((dot, i) => (
                <Box key={i} args={[0.4, 0.15, 0.15]} position={[dot.offset, 0.15, dot.lane]}>
                    <meshStandardMaterial 
                        color={dot.lane > 0 ? "#ef4444" : "#eab308"} 
                        emissive={dot.lane > 0 ? "#b91c1c" : "#ca8a04"}
                        emissiveIntensity={1.5}
                    />
                </Box>
            ))}
        </group>
    )
}

function DataConnection({ start, end, color, pulse = false }: { start: [number, number, number], end: [number, number, number], color: string, pulse?: boolean }) {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const materialRef = useRef<THREE.LineBasicMaterial>(null!);
    
    useFrame((state) => {
        if(pulse && materialRef.current) {
            materialRef.current.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
        }
    });

    return <Line points={points} color={color} lineWidth={2} transparent opacity={0.5} ref={materialRef as any} />;
}

function IntelligenceLabel({ position, label, type }: { position: [number, number, number], label: string, type: 'risk' | 'source' | 'asset' | 'grid' }) {
    return (
        <Html position={position} distanceFactor={15} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`px-3 py-1.5 text-xs font-mono border-l-2 rounded-r bg-black/80 backdrop-blur-md whitespace-nowrap select-none shadow-[0_0_15px_rgba(0,0,0,0.5)] transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-3
                ${type === 'risk' ? 'border-red-500 text-red-400' : 
                  type === 'source' ? 'border-blue-500 text-blue-400' : 
                  type === 'grid' ? 'border-amber-500 text-amber-400' :
                  'border-emerald-500 text-emerald-400'}
            `}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                    type === 'risk' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                    type === 'source' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 
                    type === 'grid' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                    'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                }`}></div>
                <span className="font-bold tracking-wider uppercase">{label}</span>
            </div>
        </Html>
    );
}

function CityScene() {
    const groupRef = useRef<THREE.Group>(null!);
    
    useFrame(() => {
        if(groupRef.current) {
            groupRef.current.rotation.y = Math.sin(Date.now() * 0.0001) * 0.05; 
        }
    })

    return (
        <group ref={groupRef} position={[0, -2.5, 0]}> 
            
            {/* --- BANK HQ --- */}
            <group position={[1, 0, -1]}>
                <Box args={[6, 0.1, 6]} position={[0, 0.05, 0]}>
                     <meshStandardMaterial color="#1e293b" roughness={0.9} />
                </Box>
                
                <ConcreteBuilding position={[0, 3.5, 0]} scale={[2.5, 7, 2.5]} color="#94a3b8" windows={true} />
                <ConcreteBuilding position={[0, 0.5, 1.5]} scale={[2, 1, 1]} color="#475569" />
                
                <Text position={[0, 6.5, 1.3]} fontSize={0.4} color="#e2e8f0" fontWeight="bold" letterSpacing={0.1}>BANK HQ</Text>
                <Box args={[1.8, 0.6, 0.1]} position={[0, 6.5, 1.26]}>
                    <meshStandardMaterial color="#0f172a" />
                </Box>
                
                <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <sphereGeometry args={[4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            </group>

            {/* --- GRID SUBSTATION --- */}
            <group position={[-3, 0, 1]}>
                <Box args={[3.5, 0.1, 3]} position={[0, 0.05, 0]}>
                     <meshStandardMaterial color="#334155" roughness={1} />
                </Box>
                <Line points={[[-1.7,0,1.4], [1.7,0,1.4], [1.7,0,-1.4], [-1.7,0,-1.4], [-1.7,0,1.4]]} color="#64748b" lineWidth={1} />
                
                <SubstationUnit position={[-0.8, 0, 0]} />
                <SubstationUnit position={[0.8, 0, 0]} />
                
                <Cylinder args={[0.05, 0.2, 2.5]} position={[-1.5, 1.25, -1]} rotation={[0,0,0]}>
                    <meshStandardMaterial color="#475569" metalness={0.5} />
                </Cylinder>
            </group>

            {/* --- BACKGROUND BUILDINGS --- */}
            <ConcreteBuilding position={[-3, 2, -4]} scale={[2.5, 4, 2.5]} color="#334155" windows={true} />
            <ConcreteBuilding position={[4, 3, -4]} scale={[3, 6, 3]} color="#1e293b" windows={true} />
            <ConcreteBuilding position={[5, 1.5, 2]} scale={[2, 3, 2]} color="#334155" windows={true} />

            {/* --- INFRASTRUCTURE --- */}
            <RealisticRoad position={[0, 0.05, 3.5]} length={12} />
            <RealisticRoad position={[-4, 0.05, 0]} length={10} rotation={[0, Math.PI/2, 0]} />

            {/* --- INTELLIGENCE LAYER --- */}
            <group>
                <IntelligenceLabel position={[-2, 3, 1]} label="GRID: STABLE" type="grid" />
                <DataConnection start={[-1.5, 1.5, 1]} end={[1, 3, -1]} color="#f59e0b" pulse={true} />
            </group>

            <group position={[2, 7.8, -1]}>
                <IntelligenceLabel position={[0, 0, 0]} label="ASSET: SECURE" type="asset" />
                <Line points={[[0,0,0], [0,-2,0]]} color="#10b981" transparent opacity={0.3} />
            </group>

            <group position={[3, 1.5, 3]}>
                <IntelligenceLabel position={[0, 0.5, 0]} label="RISK: CROWD" type="risk" />
                <DataConnection start={[4, 0, 3.5]} end={[2, 1, 2]} color="#ef4444" />
            </group>

            {/* 4. Environmental Flood Risk */}
            <group position={[-1.5, 0.5, 3.5]}>
                 <IntelligenceLabel position={[0, 0, 0]} label="ENV: FLOOD RISK" type="source" />
                 <Box args={[0.6, 0.1, 0.6]} position={[0, -0.4, 0]}>
                     <meshBasicMaterial color="#3b82f6" wireframe />
                 </Box>
            </group>

            {/* 5. Perimeter Sensor */}
            <group position={[1, 1.5, 1.5]}>
                 <IntelligenceLabel position={[0, 0, 0]} label="SENSOR: ACTIVE" type="asset" />
                 <Line points={[[0,0,0], [0,-1.5,0]]} color="#10b981" transparent opacity={0.3} />
            </group>

            {/* 6. Comms Uplink */}
            <group position={[4, 5, -2]}>
                 <IntelligenceLabel position={[0, 0, 0]} label="UPLINK: ENCRYPTED" type="source" />
                 <DataConnection start={[4, 4, -2]} end={[2, 5, -1]} color="#3b82f6" pulse={true} />
            </group>

        </group>
    );
}

export default function AssetScene() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [8, 8, 12], fov: 30 }} dpr={[1, 2]}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[-5, 10, 5]} intensity={0.8} color="#ffffff" castShadow />
        <pointLight position={[5, 5, 5]} intensity={0.4} color="#3b82f6" />
        <fog attach="fog" args={['#02040A', 15, 40]} />
        
        <CityScene />
        
        <OrbitControls 
            enableZoom={false} 
            enableRotate={true} 
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
