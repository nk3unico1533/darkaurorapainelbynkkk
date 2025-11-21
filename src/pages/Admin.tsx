import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Ban, UserX, AlertTriangle, Crown, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  credits_remaining: number;
  is_banned: boolean;
};

type ModerationAction = {
  id: string;
  user_id: string;
  moderator_id: string;
  action_type: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationAction[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<string>("ban");
  const [reason, setReason] = useState("");
  const [newRole, setNewRole] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    fetchModerationLogs();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.rpc("get_user_role", { user_id: user.id });
    
    if (error || !data || (data !== "admin" && data !== "owner")) {
      toast.error("Acesso negado");
      navigate("/");
      return;
    }
    
    setUserRole(data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      const { data: credits } = await supabase.from("user_credits").select("*");

      if (profiles && roles) {
        const usersData = await Promise.all(
          profiles.map(async (profile: any) => {
            const role = roles.find((r: any) => r.user_id === profile.id);
            const credit = credits?.find((c: any) => c.user_id === profile.id);
            
            // Get email from profiles or try to fetch from auth
            let email = "N/A";
            try {
              const { data } = await supabase.auth.admin.listUsers();
              if (data && data.users) {
                const authUser = data.users.find((u: any) => u.id === profile.id);
                email = authUser?.email || "N/A";
              }
            } catch (e) {
              console.error("Error fetching auth user:", e);
            }
            
            return {
              id: profile.id,
              email,
              role: role?.role || "user",
              display_name: profile.display_name,
              credits_remaining: credit?.credits_remaining || 0,
              is_banned: false,
            };
          })
        );

        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    }
  };

  const fetchModerationLogs = async () => {
    const { data } = await supabase
      .from("user_moderation")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) setModerationLogs(data);
  };

  const handleModerateUser = async () => {
    if (!selectedUser || !user) return;

    const { error } = await supabase.from("user_moderation").insert({
      user_id: selectedUser.id,
      moderator_id: user.id,
      action_type: actionType,
      reason: reason,
      is_active: true,
    });

    if (error) {
      toast.error("Erro ao aplicar ação");
      return;
    }

    toast.success(`Ação "${actionType}" aplicada com sucesso`);
    setSelectedUser(null);
    setReason("");
    fetchModerationLogs();
  };

  const handleChangeRole = async (userId: string, newRoleValue: "user" | "premium" | "admin" | "owner") => {
    if (!user) return;

    // Check if trying to demote another admin
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === "admin" && userRole !== "owner") {
      toast.error("Apenas o dono pode modificar outros administradores");
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRoleValue })
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao alterar role");
      return;
    }

    toast.success("Role alterada com sucesso");
    fetchUsers();
  };

  const handleDeactivateModeration = async (moderationId: string) => {
    const { error } = await supabase
      .from("user_moderation")
      .update({ is_active: false })
      .eq("id", moderationId);

    if (error) {
      toast.error("Erro ao desativar ação");
      return;
    }

    toast.success("Ação desativada com sucesso");
    fetchModerationLogs();
  };

  if (loading) {
    return <div className="min-h-screen aurora-bg flex items-center justify-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen aurora-bg py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-neon-purple" />
          <h1 className="text-4xl font-bold gradient-text">Painel Administrativo</h1>
          {userRole === "owner" && (
            <Badge variant="default" className="ml-2">
              <Crown className="w-3 h-3 mr-1" />
              Dono
            </Badge>
          )}
        </div>

        {/* User Management */}
        <Card className="glass-panel-strong rgb-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie roles, banimentos e restrições dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((usr) => (
                  <TableRow key={usr.id}>
                    <TableCell>{usr.email}</TableCell>
                    <TableCell>{usr.display_name || "N/A"}</TableCell>
                    <TableCell>
                      <Select
                        value={usr.role}
                        onValueChange={(value: "user" | "premium" | "admin" | "owner") => handleChangeRole(usr.id, value)}
                        disabled={usr.role === "admin" && userRole !== "owner"}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {userRole === "owner" && (
                            <SelectItem value="owner">Owner</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{usr.credits_remaining}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(usr)}
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Moderar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aplicar Ação de Moderação</DialogTitle>
                            <DialogDescription>
                              Usuário: {usr.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={actionType} onValueChange={setActionType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ban">Banir</SelectItem>
                                <SelectItem value="restrict">Restringir</SelectItem>
                                <SelectItem value="warn">Avisar</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              placeholder="Motivo da ação..."
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleModerateUser}>Aplicar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Moderation Logs */}
        <Card className="glass-panel-strong rgb-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Logs de Moderação
            </CardTitle>
            <CardDescription>
              Histórico de ações de moderação aplicadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário ID</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moderationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action_type === "ban" ? "destructive" : "secondary"}>
                        {log.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.reason || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={log.is_active ? "default" : "outline"}>
                        {log.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateModeration(log.id)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Desativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
