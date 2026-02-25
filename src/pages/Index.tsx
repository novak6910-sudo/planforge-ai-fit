import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">GymPlanner</span>
          </div>
          <Button size="sm" onClick={() => navigate("/auth")} className="rounded-xl">
            Get Started
          </Button>
        </div>
      </nav>
      <HeroSection onGetStarted={() => navigate("/auth")} />
    </div>
  );
};

export default Index;
