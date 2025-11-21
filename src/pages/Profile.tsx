import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Coins, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
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
                  placeholder="Seu nome"
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
