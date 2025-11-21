import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

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

        <Card className="glass-panel-strong">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Configurações</CardTitle>
            <CardDescription>Gerencie as configurações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preferências</h3>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá personalizar suas preferências de notificações, temas e muito mais.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacidade</h3>
              <p className="text-sm text-muted-foreground">
                Suas informações estão protegidas e você tem controle total sobre seus dados.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Segurança</h3>
              <p className="text-sm text-muted-foreground">
                Configure opções de segurança adicionais para proteger sua conta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
