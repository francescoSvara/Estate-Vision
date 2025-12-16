import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
          See the Physical World Clearly.
        </h2>
        <button className="bg-white text-black px-10 py-4 text-lg font-bold hover:bg-gray-200 transition-colors tracking-wide">
          REQUEST ACCESS
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="mb-4 md:mb-0 font-mono">© 2024 ESTATEVISION. ALL RIGHTS RESERVED.</div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

