import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import PlatformSection from '@/components/PlatformSection';
import UseCasesSection from '@/components/UseCasesSection';
import InterfacePreview from '@/components/InterfacePreview';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import DataStream from '@/components/DataStream';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#02040A] text-white selection:bg-blue-500/30 relative">
      {/* Continuous Data Stream Background */}
      <DataStream />
      
      <Navbar />
      <Hero />
      <ProblemSection />
      <PlatformSection />
      <UseCasesSection />
      <InterfacePreview />
      <CTA />
      <Footer />
    </main>
  );
}
