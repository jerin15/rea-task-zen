import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { AppRole } from "@/types/tasks";
import KanbanBoard from "@/components/KanbanBoard";
import TaskAssistant from "@/components/TaskAssistant";
import ExportReports from "@/components/ExportReports";
import logo from "@/assets/rea-logo.png";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      if (roles && roles.length > 0) {
        const role = roles[0].role as AppRole;
        setUserRole(role);
        setSelectedRole(role);
        setIsAdmin(role === 'admin');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userRole || !selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Role Assigned</h2>
          <p className="text-muted-foreground mb-4">
            Please contact your administrator to assign a role.
          </p>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="REA Advertising" className="h-12 w-auto" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                R-EAsiness
              </h1>
              {isAdmin && (
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as AppRole)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estimation">Estimation</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TaskAssistant userId={userId} userRole={selectedRole} />
              {isAdmin && <ExportReports />}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <KanbanBoard
          userRole={selectedRole}
          userId={userId}
          isAdmin={isAdmin}
        />
      </main>
    </div>
  );
};

export default Dashboard;
