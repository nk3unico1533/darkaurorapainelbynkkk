import { ArrowDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const scrollToDashboard = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden aurora-bg">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-fuchsia/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        <div className="absolute top-10 right-10 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-neon-pink/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-slide-in">
          <div className="inline-block">
            <span className="text-xs sm:text-sm uppercase tracking-wider text-neon-purple font-semibold px-3 sm:px-4 py-2 rounded-full bg-primary/20 border border-neon-purple/30 neon-glow">
              Sistema Profissional de Consultas
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight px-2">
            <span className="gradient-text">Dark Aurora</span>
            <br />
            <span className="text-foreground">Painel</span>
          </h1>
          
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            Consultas inteligentes com tecnologia de ponta. 
            Interface moderna e segura para suas buscas profissionais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-4">
            <button
              onClick={scrollToDashboard}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 neon-glow hover:neon-glow-strong flex items-center justify-center gap-2 hover-scale animate-fade-in hover:shadow-2xl hover:shadow-neon-purple/50 animate-scale-pulse"
            >
              {user ? "Acessar Dashboard" : "Fazer Login para Acessar"}
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </button>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-mono">By </span>
              <span className="rgb-text font-bold text-xl sm:text-2xl">nk</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-8 sm:pt-12 px-2">
            {[
              { label: "CPF", icon: "👤" },
              { label: "CNPJ", icon: "🏢" },
              { label: "Telefone", icon: "📱" },
              { label: "Placa", icon: "🚗" }
            ].map((item, idx) => (
              <div
                key={item.label}
                className="glass-panel p-3 sm:p-4 rounded-xl hover:neon-border transition-all duration-300 cursor-pointer hover-scale animate-fade-in animate-glow group relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/0 to-neon-violet/0 group-hover:from-neon-purple/10 group-hover:to-neon-violet/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl mb-2 animate-float transition-transform group-hover:scale-110" style={{ animationDelay: `${idx * 0.2}s` }}>{item.icon}</div>
                  <div className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-neon-purple transition-colors">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-neon-purple" />
      </div>
    </section>
  );
};

export default Hero;
