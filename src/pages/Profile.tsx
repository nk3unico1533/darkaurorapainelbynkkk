import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, Crown, Hash, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [numericId, setNumericId] = useState<number | null>(null);
  const [lastUsernameChange, setLastUsernameChange] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [credits, setCredits] = useState({ creditsRemaining: 0, dailyLimit: 0 });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserRole();
      loadCredits();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setUsername(data.username || "");
      setNumericId(data.numeric_id);
      setLastUsernameChange(data.last_username_change);
    }
  };

  const loadUserRole = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("get_user_role", { user_id: user.id });
    setUserRole(data);
  };

  const loadCredits = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("get_user_credits", { user_id: user.id });
    if (data && data.length > 0) {
      setCredits({
        creditsRemaining: data[0].credits_remaining,
        dailyLimit: data[0].daily_limit,
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName
      })
      .eq("id", user?.id);

    if (error) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }

    setLoading(false);
  };

  const handleUpdateUsername = async () => {
    if (!user?.id || !username) return;
    
    setLoading(true);
    const { data, error } = await supabase.rpc("update_username", {
      user_id: user.id,
      new_username: username
    }) as { data: any; error: any };

    if (error || (data && !data.success)) {
      const errorMsg = data?.error || error?.message || "Erro desconhecido";
      toast.error("Erro ao atualizar username", { 
        description: errorMsg
      });
    } else {
      toast.success("Username atualizado com sucesso!");
      loadProfile();
    }

    setLoading(false);
  };

  const canChangeUsername = () => {
    if (!lastUsernameChange) return true;
    const lastChange = new Date(lastUsernameChange);
    const daysSince = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  };

  const getDaysUntilChange = () => {
    if (!lastUsernameChange) return 0;
    const lastChange = new Date(lastUsernameChange);
    const daysSince = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSince);
  };

  return (
    <div className="min-h-screen aurora-bg py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Credits and Role Card */}
        <Card className="glass-panel-strong rgb-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-neon-purple" />
              Seus Créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Créditos Restantes</p>
                <p className="text-3xl font-bold gradient-text">
                  {credits.creditsRemaining}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Limite Diário</p>
                <p className="text-3xl font-bold text-foreground">
                  {credits.dailyLimit}
                </p>
              </div>
            </div>
            {userRole && (
              <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                <p className="text-sm text-muted-foreground">Seu Plano</p>
                <Badge variant="default" className="flex items-center gap-1">
                  {(userRole === "owner" || userRole === "admin" || userRole === "premium") && (
                    <Crown className="w-3 h-3" />
                  )}
                  {userRole.toUpperCase()}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rgb-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-neon-cyan" />
              Identificação do Usuário
            </CardTitle>
            <CardDescription>
              Seu ID único e username no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 glass-panel rounded-lg neon-glow">
              <p className="text-sm text-muted-foreground mb-2">Seu ID Numérico</p>
              <div className="flex items-center gap-2">
                <Hash className="w-8 h-8 text-neon-cyan" />
                <p className="text-5xl font-bold gradient-text">
                  {numericId !== null ? numericId : "---"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ID único e permanente (1 a 99999)
              </p>
            </div>
            <div className="p-4 glass-panel rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Username</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-neon-purple" />
                @{username || "não definido"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rgb-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-neon-purple" />
              Username
            </CardTitle>
            <CardDescription>
              Você pode alterar seu username a cada 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!canChangeUsername() && (
              <Alert>
                <AlertDescription>
                  Você poderá mudar seu username novamente em {getDaysUntilChange()} dias
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Novo Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="seunome123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!canChangeUsername()}
              />
            </div>
            <Button 
              onClick={handleUpdateUsername} 
              className="w-full" 
              disabled={loading || !canChangeUsername()}
            >
              {loading ? "Salvando..." : "Atualizar Username"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel-strong rgb-border">
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de Exibição</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
