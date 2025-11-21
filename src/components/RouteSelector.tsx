import { ModuleType } from "./ModuleSelector";

interface Route {
  value: string;
  label: string;
}

const routesByModule: Record<ModuleType, Route[]> = {
  cpf: [
    { value: "cpf-full", label: "CPF Full" },
    { value: "cpf-low", label: "CPF Low" },
    { value: "45m", label: "45M" },
  ],
  telefone: [
    { value: "tel-full", label: "Tel Full" },
    { value: "tel-medium", label: "Tel Medium" },
    { value: "tel-low", label: "Tel Low" },
  ],
  nome: [
    { value: "nome-op1", label: "Nome Op1" },
    { value: "nome-op2", label: "Nome Op2" },
  ],
  placa: [{ value: "placa-padrao", label: "Padrão" }],
  email: [{ value: "email-padrao", label: "Padrão" }],
  cep: [{ value: "cep-padrao", label: "Padrão" }],
  cnpj: [{ value: "cnpj-padrao", label: "Padrão" }],
  rg: [{ value: "rg-padrao", label: "Padrão" }],
};

interface RouteSelectorProps {
  module: ModuleType;
  selectedRoute: string;
  onSelectRoute: (route: string) => void;
}

const RouteSelector = ({ module, selectedRoute, onSelectRoute }: RouteSelectorProps) => {
  const routes = routesByModule[module];

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Selecionar Rota
      </label>
      <select
        value={selectedRoute}
        onChange={(e) => onSelectRoute(e.target.value)}
        className="w-full bg-background/20 backdrop-blur-md border border-border/20 px-4 py-3 rounded-xl font-semibold text-foreground 
                   focus:outline-none focus:neon-border transition-all duration-300
                   cursor-pointer"
      >
        {routes.map((route) => (
          <option key={route.value} value={route.value} className="bg-card text-foreground">
            {route.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RouteSelector;
