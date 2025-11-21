import { MessageCircle, Instagram } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative py-12 aurora-bg border-t border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo/Brand */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold gradient-text">Dark Aurora Painel</h3>
            <p className="text-sm text-muted-foreground">
              Sistema profissional de consultas
            </p>
          </div>

          {/* Creator Badge */}
          <div className="glass-panel px-8 py-4 rounded-2xl rgb-border">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-lg">Desenvolvido por</span>
            <span className="rgb-text font-bold text-2xl">nk</span>
          </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://discord.gg/4qYCYs7HSw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Discord"
            >
              <MessageCircle size={28} />
            </a>
            <a 
              href="https://instagram.com/nkounico" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="Instagram"
            >
              <Instagram size={28} />
            </a>
            <a 
              href="https://www.tiktok.com/@nkounico00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              aria-label="TikTok"
            >
              <FaTiktok size={28} />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-border/20 w-full max-w-2xl">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Dark Aurora Painel. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -bottom-1/2 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/4 w-96 h-96 bg-neon-violet/20 rounded-full blur-3xl" />
      </div>
    </footer>
  );
};

export default Footer;
