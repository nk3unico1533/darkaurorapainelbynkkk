import { LucideIcon } from "lucide-react";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Car,
  CreditCard,
} from "lucide-react";

export type ModuleType = "cpf" | "cnpj" | "cep" | "telefone" | "email" | "nome" | "placa" | "rg";

interface Module {
  id: ModuleType;
  label: string;
  icon: LucideIcon;
}

const modules: Module[] = [
  { id: "cpf", label: "CPF", icon: User },
  { id: "cnpj", label: "CNPJ", icon: Building2 },
  { id: "cep", label: "CEP", icon: MapPin },
  { id: "telefone", label: "Telefone", icon: Phone },
  { id: "email", label: "Email", icon: Mail },
  { id: "nome", label: "Nome", icon: Users },
  { id: "placa", label: "Placa", icon: Car },
  { id: "rg", label: "RG", icon: CreditCard },
];

interface ModuleSelectorProps {
  selectedModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
}

const ModuleSelector = ({ selectedModule, onSelectModule }: ModuleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {modules.map((module, idx) => {
        const Icon = module.icon;
        const isSelected = selectedModule === module.id;
        
        return (
          <button
            key={module.id}
            onClick={() => onSelectModule(module.id)}
            className={`
              glass-panel p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl
              ${isSelected ? "neon-border animate-glow scale-105" : "hover:neon-border"}
              group animate-slide-up relative overflow-hidden
            `}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-violet/10 animate-pulse" />
            )}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <Icon
                className={`w-8 h-8 transition-all duration-300 ${
                  isSelected ? "text-neon-purple animate-bounce-slow" : "text-muted-foreground group-hover:text-neon-purple group-hover:scale-110"
                }`}
              />
              <span
                className={`font-semibold transition-colors ${
                  isSelected ? "text-neon-purple" : "text-foreground"
                }`}
              >
                {module.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ModuleSelector;
