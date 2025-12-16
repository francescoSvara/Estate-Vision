import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#02040A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
            <Image 
                src="/logos/EstateVision_LogoEsteso_Bianco.svg" 
                alt="EstateVision" 
                width={180} 
                height={40} 
                className="h-8 w-auto"
            />
        </div>
        <div className="hidden md:flex items-center space-x-8">
             {/* Navigation Links if needed */}
        </div>
        <button className="bg-white text-black px-6 py-2.5 text-xs font-bold hover:bg-gray-200 transition-colors tracking-widest uppercase">
            Request Access
        </button>
      </div>
    </nav>
  );
}
