import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import HistoryPanel from "@/components/HistoryPanel";
import Particles from "@/components/Particles";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Particles />
      <Header />
      <Hero />
      <Dashboard />
      <Footer />
      <HistoryPanel />
    </div>
  );
};

export default Index;
