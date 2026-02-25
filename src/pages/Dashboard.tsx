import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Droplets, Flame, Crown, TrendingUp, Target, Play, FileText, BarChart3, Activity,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Profile {
  display_name: string | null;
  is_premium: boolean;
  workout_streak: number;
  water_streak: number;
  daily_water_goal: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
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
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [profileRes, waterRes, workoutRes, countRes] = await Promise.all([
        supabase.from("profiles").select("display_name, is_premium, workout_streak, water_streak, daily_water_goal").eq("user_id", user.id).single(),
        supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).gte("logged_at", todayStart.toISOString()),
        supabase.from("workout_logs").select("calories_burned").eq("user_id", user.id).gte("logged_at", todayStart.toISOString()),
        supabase.from("workout_logs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (waterRes.data) setTodayWater(waterRes.data.reduce((s, w) => s + w.amount_ml, 0));
      if (workoutRes.data) setTodayCalories(workoutRes.data.reduce((s, w) => s + w.calories_burned, 0));
      setTotalWorkouts(countRes.count ?? 0);
    };
    fetchData();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const waterGoal = profile?.daily_water_goal ?? 2500;
  const waterPercent = Math.min(100, (todayWater / waterGoal) * 100);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.display_name || "Athlete"} 👋
          </h1>
          {profile?.is_premium && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-premium/20 text-premium text-xs font-medium mt-1">
              <Crown className="w-3 h-3" /> Pro
            </span>
          )}
        </div>

        {/* 4 Big Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:border-destructive/50 transition-all active:scale-[0.98]" onClick={() => navigate("/tracking?tab=calories")}>
            <CardContent className="p-5 text-center">
              <Flame className="w-10 h-10 text-destructive mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{todayCalories}</p>
              <p className="text-sm text-muted-foreground mt-1">🔥 Calories Today</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-accent/50 transition-all active:scale-[0.98]" onClick={() => navigate("/tracking?tab=water")}>
            <CardContent className="p-5 text-center">
              <Droplets className="w-10 h-10 text-accent mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{Math.round(waterPercent)}%</p>
              <p className="text-sm text-muted-foreground mt-1">💧 Water Today</p>
              <Progress value={waterPercent} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-success/50 transition-all active:scale-[0.98]" onClick={() => navigate("/analytics?tab=streak")}>
            <CardContent className="p-5 text-center">
              <TrendingUp className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{profile?.workout_streak ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">📅 Day Streak</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]" onClick={() => navigate("/analytics?tab=workouts")}>
            <CardContent className="p-5 text-center">
              <Target className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{totalWorkouts}</p>
              <p className="text-sm text-muted-foreground mt-1">🏋️ Total Workouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Primary CTA */}
        <Button
          size="lg"
          onClick={() => navigate("/create")}
          className="w-full h-14 text-lg rounded-xl gap-2 shadow-lg shadow-primary/20"
        >
          <Play className="w-5 h-5" /> Start Today's Workout
        </Button>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/plans")}
            className="w-full h-12 rounded-xl gap-3 justify-start"
          >
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium">My Plans</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/tracking")}
            className="w-full h-12 rounded-xl gap-3 justify-start"
          >
            <Activity className="w-5 h-5 text-accent" />
            <span className="font-medium">Open Tracking</span>
          </Button>
          {!profile?.is_premium && (
            <Button
              size="lg"
              onClick={() => navigate("/premium")}
              className="w-full h-12 rounded-xl gap-3 bg-premium text-premium-foreground hover:bg-premium/90"
            >
              <Crown className="w-5 h-5" />
              <span className="font-medium">Upgrade to Premium</span>
            </Button>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
