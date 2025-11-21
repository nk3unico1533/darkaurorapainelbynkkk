import { useState, useEffect, useRef } from "react";
import { History, X, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

interface ConsultationHistory {
  id: string;
  module: string;
  route: string;
  query: string;
  result: any;
  created_at: string;
}

const HistoryPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ConsultationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Draggable state
  const [buttonPos, setButtonPos] = useState({ x: 20, y: window.innerHeight - 100 });
  const [panelPos, setPanelPos] = useState({ x: 20, y: 100 });
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchHistory();
    }
  }, [user, isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("consultation_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Erro ao carregar histórico");
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase
      .from("consultation_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar item");
    } else {
      toast.success("Item removido");
      fetchHistory();
    }
  };

  // Button drag handlers
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDraggingButton(true);
    }
  };

  // Panel drag handlers
  const handlePanelMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current && (e.target as HTMLElement).classList.contains('drag-handle')) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDraggingPanel(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingButton) {
        setButtonPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isDraggingPanel) {
        setPanelPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingButton(false);
      setIsDraggingPanel(false);
    };

    if (isDraggingButton || isDraggingPanel) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingButton, isDraggingPanel, dragOffset]);

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        ref={buttonRef}
        onMouseDown={handleButtonMouseDown}
        onClick={() => !isDraggingButton && setIsOpen(!isOpen)}
        className="fixed z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center cursor-move neon-glow"
        style={{ left: `${buttonPos.x}px`, top: `${buttonPos.y}px` }}
      >
        <History className="w-6 h-6" />
      </button>

      {/* History Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-40 w-96 max-h-[600px] glass-panel-strong rounded-2xl shadow-2xl flex flex-col"
          style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
          onMouseDown={handlePanelMouseDown}
        >
          {/* Draggable Header */}
          <div className="drag-handle flex items-center justify-between p-4 border-b border-border/50 cursor-move">
            <h3 className="font-semibold text-lg gradient-text">Histórico de Consultas</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-destructive/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma consulta realizada ainda
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-background/30 border border-border/30 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-neon-purple uppercase">
                            {item.module}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.route}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{item.query}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHistoryItem(item.id)}
                        className="hover:bg-destructive/20 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default HistoryPanel;
