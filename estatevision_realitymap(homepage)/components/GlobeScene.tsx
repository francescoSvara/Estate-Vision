'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points on a sphere
const generatePoints = (count: number, radius: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    
    points.push(
      new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      )
    );
  }
  return points;
};

function DataPoints({ count = 1000, radius = 1.5 }) {
  const points = useMemo(() => generatePoints(count, radius), [count, radius]);
  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    points.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    });
    return pos;
  }, [points, count]);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#3b82f6"
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function ConnectionLines({ count = 20, radius = 1.5 }) {
    const lines = useMemo(() => {
        const points = generatePoints(count, radius);
        const geometry = new THREE.BufferGeometry();
        const linePoints = [];
        
        // Create connections between nearby points
        for(let i=0; i<points.length; i++) {
            for(let j=i+1; j<points.length; j++) {
                if(points[i].distanceTo(points[j]) < radius * 0.5) {
                     // Create a curve between points to follow surface somewhat
                     const curve = new THREE.CatmullRomCurve3([
                        points[i],
                        points[i].clone().add(points[j]).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.1), // Midpoint raised
                        points[j]
                     ]);
                     linePoints.push(...curve.getPoints(10));
                }
            }
        }
        geometry.setFromPoints(linePoints);
        return geometry;
    }, [count, radius]);

    const ref = useRef<THREE.LineSegments>(null!);

    useFrame(() => {
        if(ref.current) ref.current.rotation.y += 0.001;
    });

    return (
        <lineSegments ref={ref}>
             <primitive object={lines} attach="geometry" />
             <lineBasicMaterial color="#8b5cf6" transparent opacity={0.15} linewidth={1} />
        </lineSegments>
    )
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Core Dark Sphere */}
      <Sphere ref={meshRef} args={[1.48, 64, 64]}>
        <meshPhongMaterial 
            color="#000000" 
            emissive="#050816"
            specular="#111111"
            shininess={10}
            transparent
            opacity={0.9}
        />
      </Sphere>
      
      {/* Atmosphere Glow */}
      <Sphere args={[1.5, 64, 64]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>

      <DataPoints />
      <ConnectionLines count={40} />
      
      {/* Floating Labels */}
      <group rotation={[0, 1, 0]}>
         <Html position={[1.6, 0.2, 0]}>
             <div className="px-2 py-1 bg-black/80 border border-blue-500/30 text-[10px] font-mono text-blue-400 backdrop-blur-sm whitespace-nowrap">
                 DATACENTER_EU_WEST
             </div>
         </Html>
      </group>
      <group rotation={[0, -2, 0]}>
         <Html position={[1.6, -0.5, 0.5]}>
             <div className="px-2 py-1 bg-black/80 border border-purple-500/30 text-[10px] font-mono text-purple-400 backdrop-blur-sm whitespace-nowrap">
                 GRID_NODE_NA_EAST
             </div>
         </Html>
      </group>
    </group>
  );
}

export default function GlobeScene() {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <Globe />
        <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  );
}

