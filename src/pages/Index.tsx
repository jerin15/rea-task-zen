import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            R-EAsiness
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            AI-powered task management for REA Creative Agency
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Streamline your workflow with smart Kanban boards, <br />
            intelligent reminders, and role-based pipelines.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
