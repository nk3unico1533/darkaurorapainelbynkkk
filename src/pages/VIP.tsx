import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Zap, Shield } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useNavigate } from "react-router-dom";

const VIP = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen aurora-bg py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-12 h-12 text-neon-purple animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                Torne-se VIP
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Desbloqueie todo o potencial da plataforma com benefícios exclusivos
            </p>
          </div>

          {/* Plans Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="glass-panel-strong rgb-border">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6 text-muted-foreground" />
                  <CardTitle className="text-2xl">Usuário Comum</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Acesso básico à plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    <span className="text-foreground">7 consultas por dia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    <span className="text-foreground">Acesso aos módulos básicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    <span className="text-foreground">Histórico de consultas</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-3xl font-bold gradient-text">Grátis</p>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="glass-panel-strong rgb-border relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-neon-purple/20 to-transparent w-32 h-32 blur-2xl" />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-neon-purple" />
                  <CardTitle className="text-2xl gradient-text">Usuário Premium</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Máxima performance e recursos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-foreground font-semibold">25 consultas por dia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-foreground">Acesso a todos os módulos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-foreground">Prioridade no suporte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-purple" />
                    <span className="text-foreground">Histórico ilimitado</span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Entre em contato</p>
                  <p className="text-3xl font-bold gradient-text">Consulte valores</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="glass-panel-strong rgb-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">
                Entre em Contato
              </CardTitle>
              <CardDescription className="text-base">
                Fale com nk ou aurora para mais informações sobre o plano Premium
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-center">
                  Junte-se ao nosso servidor do Discord para conversar diretamente com a equipe
                </p>
                <Button
                  size="lg"
                  className="gap-2 group"
                  onClick={() => window.open('https://discord.gg/4qYCYs7HSw', '_blank')}
                >
                  <SiDiscord className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Acessar Discord
                </Button>
              </div>

              <div className="w-full max-w-md p-6 glass-panel rounded-xl space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Disponível para responder suas dúvidas e processar sua assinatura Premium
                </p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="font-semibold text-neon-purple">@nk</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold text-neon-purple">@aurora</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VIP;
