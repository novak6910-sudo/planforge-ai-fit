import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell, Droplets, Flame, Crown, LogOut, Home,
  FileText, BarChart3, Target, TrendingUp, Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  display_name: string | null;
  is_premium: boolean;
  workout_streak: number;
  water_streak: number;
  xp_points: number;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayWater, setTodayWater] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, is_premium, workout_streak, water_streak, xp_points")
        .eq("user_id", user.id)
        .single();
      if (p) setProfile(p);

      // Fetch today's water
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data: waterData } = await supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .gte("logged_at", todayStart.toISOString());
      if (waterData) setTodayWater(waterData.reduce((s, w) => s + w.amount_ml, 0));

      // Fetch today's workouts
      const { data: workoutData } = await supabase
        .from("workout_logs")
        .select("calories_burned")
        .eq("user_id", user.id)
        .gte("logged_at", todayStart.toISOString());
      if (workoutData) {
        setTodayCalories(workoutData.reduce((s, w) => s + w.calories_burned, 0));
      }

      // Total workouts
      const { count } = await supabase
        .from("workout_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setTotalWorkouts(count ?? 0);
    };

    fetchData();
  }, [user]);

  const addWater = async (ml: number) => {
    if (!user) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: user.id, amount_ml: ml });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTodayWater((prev) => prev + ml);
      toast({ title: `+${ml}ml 💧`, description: `Total: ${todayWater + ml}ml` });
    }
  };

  const waterGoal = 2500;
  const waterPercent = Math.min(100, (todayWater / waterGoal) * 100);

  const level = profile?.xp_points
    ? profile.xp_points >= 5000 ? "Elite" : profile.xp_points >= 2000 ? "Advanced" : profile.xp_points >= 500 ? "Intermediate" : "Beginner"
    : "Beginner";

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">GymPlanner</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Home</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hey, {profile?.display_name || "Athlete"} 👋
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-primary" /> Level: {level}
              {profile?.is_premium && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-premium/20 text-premium text-xs font-medium">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              )}
            </p>
          </div>
          {!profile?.is_premium && (
            <Button size="sm" className="bg-primary">
              <Crown className="w-4 h-4 mr-1" /> Upgrade
            </Button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{todayCalories}</p>
              <p className="text-xs text-muted-foreground">Calories Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{profile?.workout_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Droplets className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{profile?.water_streak ?? 0}</p>
              <p className="text-xs text-muted-foreground">Water Streak 💧</p>
            </CardContent>
          </Card>
        </div>

        {/* Water Intake */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-accent" /> Water Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{todayWater}ml / {waterGoal}ml</span>
              <span className="font-medium text-foreground">{Math.round(waterPercent)}%</span>
            </div>
            <Progress value={waterPercent} className="h-3" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => addWater(250)}>+250ml</Button>
              <Button size="sm" variant="outline" onClick={() => addWater(500)}>+500ml</Button>
              <Button size="sm" variant="outline" onClick={() => addWater(1000)}>+1L</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/")}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Generate Plan</p>
                <p className="text-sm text-muted-foreground">Create a new AI workout plan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate("/tracking")}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Tracking</p>
                <p className="text-sm text-muted-foreground">Water, calories & food</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
