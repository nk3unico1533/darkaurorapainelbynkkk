import { useState, useEffect } from "react";
import ModuleSelector, { ModuleType } from "./ModuleSelector";
import RouteSelector from "./RouteSelector";
import ConsultationInput, { inputConfigs } from "./ConsultationInput";
import ResultDisplay from "./ResultDisplay";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Lock, User, IdCard, Coins, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState<ModuleType>("cpf");
  const [selectedRoute, setSelectedRoute] = useState("cpf-full");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { creditInfo, loading: creditsLoading, useCredit, fetchCredits } = useCredits();
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setUserProfile(data);
      }
    };
    
    fetchProfile();
  }, [user]);

  const isValid = inputConfigs[selectedModule].validate(inputValue);

  const handleModuleChange = (module: ModuleType) => {
    setSelectedModule(module);
    setInputValue("");
    setResult(null);
    setError(null);

    // Set default route for new module
    const defaultRoutes: Record<ModuleType, string> = {
      cpf: "cpf-full",
      telefone: "tel-full",
      nome: "nome-op1",
      placa: "placa-padrao",
      email: "email-padrao",
      cep: "cep-padrao",
      cnpj: "cnpj-padrao",
      rg: "rg-padrao",
    };
    setSelectedRoute(defaultRoutes[module]);
  };

  const handleConsult = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (!isValid) {
      toast.error("Valor inválido", {
        description: "Por favor, verifique o formato do valor inserido.",
      });
      return;
    }

    // Check if user has credits
    if (creditInfo && creditInfo.creditsRemaining <= 0) {
      toast.error("Créditos insuficientes", {
        description: "Você não tem créditos suficientes. Entre em contato para virar VIP!",
      });
      return;
    }

    // Use one credit
    const creditUsed = await useCredit();
    if (!creditUsed) {
      toast.error("Erro ao usar crédito", {
        description: "Não foi possível processar o crédito. Tente novamente.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // API endpoints mapping
      const apiEndpoints: Record<string, string> = {
        "cpf-full": `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${inputValue}`,
        "cpf-low": `https://apis-brasil.shop/apis/apicpfcadsus.php?cpf=${inputValue}`,
        "45m": `https://apis-brasil.shop/apis/apicpf43malgar.php?cpf=${inputValue}`,
        "rg-padrao": `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${inputValue}`,
        "cep-padrao": `https://apis-brasil.shop/apis/apicep43malgar.php?cep=${inputValue}`,
        "email-padrao": `https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${inputValue}`,
        "nome-op1": `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${encodeURIComponent(inputValue)}`,
        "nome-op2": `https://apis-brasil.shop/apis/apinomefotoma.php?nome=${encodeURIComponent(inputValue)}`,
        "cnpj-padrao": `https://apis-brasil.shop/apis/apicnpj35rais2019.php?cnpj=${inputValue}`,
        "placa-padrao": `https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${inputValue}`,
        "tel-full": `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${inputValue}`,
        "tel-low": `https://apis-brasil.shop/apis/apitel2cadsus.php?telefone2=${inputValue}`,
        "tel-medium": `https://apis-brasil.shop/apis/apitel1cadsus.php?telefone=${inputValue}`,
      };

      const apiUrl = apiEndpoints[selectedRoute];
      
      if (!apiUrl) {
        throw new Error("Rota de API não encontrada");
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const apiData = await response.json();

      const resultData = {
        module: selectedModule,
        route: selectedRoute,
        query: inputValue,
        timestamp: new Date().toISOString(),
        status: "success",
        data: apiData,
      };

      setResult(resultData);
      toast.success("Consulta realizada com sucesso!", {
        description: `Módulo: ${selectedModule.toUpperCase()} • Rota: ${selectedRoute}`,
      });

      // Save to history if user is logged in
      if (user) {
        await supabase.from("consultation_history").insert({
          user_id: user.id,
          module: selectedModule,
          route: selectedRoute,
          query: inputValue,
          result: resultData
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar consulta. Tente novamente.";
      setError(errorMessage);
      toast.error("Erro na consulta", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 animate-pulse">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              Login Necessário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Para acessar todas as funcionalidades do painel e realizar consultas, você precisa fazer login na sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => {
                setShowLoginDialog(false);
                navigate("/auth");
              }}
              className="w-full sm:w-auto px-8 animate-fade-in"
            >
              Fazer Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section id="dashboard" className="min-h-screen py-20 sm:py-24 aurora-bg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="text-center space-y-3 sm:space-y-4 animate-slide-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text px-2">
                Dashboard de Consultas
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg px-4">
                Selecione um módulo e realize suas consultas profissionais
              </p>
              
              {/* User Info Card */}
              {user && userProfile && creditInfo && (
                <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in">
                  <div className="glass-panel-strong px-6 py-3 rounded-xl flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neon-purple" />
                      <span className="text-sm font-medium">
                        {userProfile.display_name || user.email}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-border/50" />
                    <div className="flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-neon-violet" />
                      <span className="text-xs font-mono text-muted-foreground">
                        ID: {user.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  {/* Credits Display */}
                  <div className="glass-panel-strong px-6 py-3 rounded-xl flex items-center gap-3">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">
                      {creditInfo.creditsRemaining}/{creditInfo.dailyLimit} créditos
                    </span>
                  </div>

                  {/* Role Badge */}
                  {creditInfo.role && (
                    <Badge 
                      variant="outline" 
                      className={`px-4 py-2 font-semibold ${
                        creditInfo.role === 'owner' ? 'border-red-500 text-red-500' :
                        creditInfo.role === 'admin' ? 'border-orange-500 text-orange-500' :
                        creditInfo.role === 'premium' ? 'border-neon-purple text-neon-purple' :
                        'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {creditInfo.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                      {creditInfo.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                      {creditInfo.role === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                      {creditInfo.role === 'owner' ? 'DONO' :
                       creditInfo.role === 'admin' ? 'ADMIN' :
                       creditInfo.role === 'premium' ? 'PREMIUM' :
                       'COMUM'}
                    </Badge>
                  )}
                </div>
              )}
              
              {!user && (
                <div className="flex items-center justify-center gap-2 text-amber-500 animate-fade-in">
                  <Lock className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Faça login para desbloquear todas as funcionalidades
                  </p>
                </div>
              )}
            </div>

          {/* Module Selection */}
          <div className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
            <ModuleSelector
              selectedModule={selectedModule}
              onSelectModule={handleModuleChange}
            />
          </div>

          {/* Consultation Panel */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 animate-slide-in" style={{ animationDelay: "0.2s" }}>
            {/* Input Section */}
            <div className={`glass-panel-strong rgb-border p-4 sm:p-6 md:p-8 rounded-2xl space-y-4 sm:space-y-6 transition-all duration-500 hover:shadow-2xl hover:shadow-neon-purple/20 ${!user ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <div className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-border/50 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                <h3 className="font-semibold text-lg sm:text-xl">
                  Consulta de {selectedModule.toUpperCase()}
                </h3>
              </div>

              <RouteSelector
                module={selectedModule}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
              />

              {/* Credits Display in Panel */}
              {user && creditInfo && !creditsLoading && (
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border/50 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium">
                      Créditos Disponíveis
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {creditInfo.creditsRemaining}/{creditInfo.dailyLimit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {creditInfo.creditsRemaining === 0 ? 'Sem créditos' : 'Créditos restantes'}
                    </p>
                  </div>
                </div>
              )}

              <ConsultationInput
                module={selectedModule}
                value={inputValue}
                onChange={setInputValue}
                onConsult={handleConsult}
                isValid={isValid}
              />

              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  💡 O botão só será habilitado quando o valor estiver no formato correto
                </p>
              </div>
            </div>

            {/* Result Section */}
            <div>
              <ResultDisplay result={result} loading={loading} error={error} />
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Dashboard;
