import { useEffect, useState } from "react";
import { Sparkles, User, Settings, LogOut } from "lucide-react";
import { SiDiscord, SiInstagram, SiTiktok } from "react-icons/si";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [userIp, setUserIp] = useState<string>("Carregando...");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setUserIp(data.ip))
      .catch(() => setUserIp("Não disponível"));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 animate-fade-in hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-neon-purple animate-pulse animate-float" />
            <h2 className="text-xl font-bold gradient-text cursor-pointer" onClick={() => navigate("/")}>Dark Aurora</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <a
                href="https://discord.gg/seu-servidor"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-2 rounded-lg hover:neon-border transition-all duration-300 hover:scale-110 group animate-glow"
                aria-label="Discord"
              >
                <SiDiscord className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors" />
              </a>
              <a
                href="https://instagram.com/seu-perfil"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-2 rounded-lg hover:neon-border transition-all duration-300 hover:scale-110 group animate-glow"
                style={{ animationDelay: "0.1s" }}
                aria-label="Instagram"
              >
                <SiInstagram className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors" />
              </a>
              <a
                href="https://tiktok.com/@seu-perfil"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-2 rounded-lg hover:neon-border transition-all duration-300 hover:scale-110 group animate-glow"
                style={{ animationDelay: "0.2s" }}
                aria-label="TikTok"
              >
                <SiTiktok className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors" />
              </a>
            </div>

            {/* IP Display */}
            <div className="glass-panel px-3 py-2 rounded-lg hidden lg:block animate-fade-in hover:neon-border transition-all duration-300" style={{ animationDelay: "0.3s" }}>
              <span className="text-muted-foreground text-xs">IP: </span>
              <span className="text-neon-purple font-mono text-xs">{userIp}</span>
            </div>

            {/* User Menu or Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
