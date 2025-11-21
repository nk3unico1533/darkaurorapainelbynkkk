import { useState, useEffect } from "react";
import { ModuleType } from "./ModuleSelector";
import { Search } from "lucide-react";

interface InputConfig {
  placeholder: string;
  mask?: (value: string) => string;
  validate: (value: string) => boolean;
  maxLength?: number;
  pattern?: RegExp;
}

const inputConfigs: Record<ModuleType, InputConfig> = {
  cpf: {
    placeholder: "000.000.000-00",
    mask: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    },
    validate: (value: string) => value.replace(/\D/g, "").length === 11,
    maxLength: 14,
    pattern: /^\d+$/,
  },
  cnpj: {
    placeholder: "00.000.000/0000-00",
    mask: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    },
    validate: (value: string) => value.replace(/\D/g, "").length === 14,
    maxLength: 18,
    pattern: /^\d+$/,
  },
  cep: {
    placeholder: "00000-000",
    mask: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
    },
    validate: (value: string) => value.replace(/\D/g, "").length === 8,
    maxLength: 9,
    pattern: /^\d+$/,
  },
  telefone: {
    placeholder: "(00) 00000-0000",
    mask: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    },
    validate: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers.length === 10 || numbers.length === 11;
    },
    maxLength: 15,
    pattern: /^\d+$/,
  },
  rg: {
    placeholder: "00.000.000-0",
    mask: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1})$/, "$1-$2");
    },
    validate: (value: string) => value.replace(/\D/g, "").length === 9,
    maxLength: 12,
    pattern: /^\d+$/,
  },
  placa: {
    placeholder: "ABC1D23",
    mask: (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    validate: (value: string) => {
      const cleaned = value.replace(/[^A-Z0-9]/g, "");
      return cleaned.length === 7 && /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleaned);
    },
    maxLength: 7,
    pattern: /^[A-Z0-9]*$/,
  },
  nome: {
    placeholder: "Digite o nome completo",
    mask: (value: string) => value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ""),
    validate: (value: string) => value.trim().split(/\s+/).length >= 2 && value.length >= 3,
  },
  email: {
    placeholder: "exemplo@email.com",
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
};

interface ConsultationInputProps {
  module: ModuleType;
  value: string;
  onChange: (value: string) => void;
  onConsult: () => void;
  isValid: boolean;
}

const ConsultationInput = ({ module, value, onChange, onConsult, isValid }: ConsultationInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const config = inputConfigs[module];

  useEffect(() => {
    setLocalValue("");
    onChange("");
  }, [module]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Apply pattern filter if exists
    if (config.pattern && newValue) {
      const filtered = newValue.split("").filter((char) => config.pattern!.test(char)).join("");
      newValue = filtered;
    }

    // Apply mask if exists
    if (config.mask) {
      newValue = config.mask(newValue);
    }

    // Apply maxLength if exists
    if (config.maxLength && newValue.length > config.maxLength) {
      return;
    }

    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid) {
      onConsult();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Digite o Valor
        </label>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder}
          className="w-full bg-background/20 backdrop-blur-md border border-border/20 px-4 py-3 rounded-xl font-mono text-lg
                     focus:outline-none focus:neon-border transition-all duration-300
                     placeholder:text-muted-foreground/50"
        />
      </div>

      <button
        onClick={onConsult}
        disabled={!isValid}
        className={`
          w-full px-6 py-4 rounded-xl font-semibold text-lg
          transition-all duration-300 flex items-center justify-center gap-2
          ${
            isValid
              ? "bg-primary hover:bg-primary/90 text-primary-foreground neon-glow hover:neon-glow-strong hover:scale-[1.02]"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }
        `}
      >
        <Search className="w-5 h-5" />
        Consultar
      </button>
    </div>
  );
};

export { inputConfigs };
export default ConsultationInput;
