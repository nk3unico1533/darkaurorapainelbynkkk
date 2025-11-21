import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ResultDisplayProps {
  result: any;
  loading: boolean;
  error: string | null;
}

const ResultDisplay = ({ result, loading, error }: ResultDisplayProps) => {
  if (loading) {
    return (
      <div className="bg-background/20 backdrop-blur-md border border-border/20 p-8 rounded-xl animate-fade-in animate-scale-pulse">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
            <div className="absolute inset-0 w-12 h-12 bg-neon-purple/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-muted-foreground animate-pulse">Processando consulta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background/20 backdrop-blur-md border border-destructive/50 p-8 rounded-xl animate-slide-in hover:shadow-2xl hover:shadow-destructive/20 transition-all duration-300">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1 animate-bounce-slow" />
          <div>
            <h3 className="font-semibold text-destructive mb-2">Erro na Consulta</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-background/20 backdrop-blur-md border border-border/20 p-8 rounded-xl animate-slide-in hover:shadow-2xl hover:shadow-neon-purple/20 transition-all duration-500 rgb-border">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-neon-purple animate-bounce-slow" />
          <h3 className="font-semibold text-xl gradient-text">Resultado da Consulta</h3>
        </div>
        
        <div className="bg-background/30 backdrop-blur-sm p-6 rounded-lg font-mono text-sm overflow-auto max-h-96 animate-slide-up">
          <pre className="text-foreground whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs text-muted-foreground text-center">
            Consulta realizada com sucesso • Dark Aurora Painel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background/20 backdrop-blur-md border border-border/20 p-8 rounded-xl text-center">
      <p className="text-muted-foreground">
        Selecione um módulo e insira os dados para realizar uma consulta
      </p>
    </div>
  );
};

export default ResultDisplay;
