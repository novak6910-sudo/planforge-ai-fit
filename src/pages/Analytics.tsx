import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell, Droplets, Flame, Home, LogOut, TrendingUp, BarChart3, Crown, Lock, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";

interface DailyData { date: string; label: string; calories: number; water: number; workouts: number }

export default function Analytics() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "calories";

  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [waterStreak, setWaterStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      const [workoutRes, waterRes, foodRes, profileRes] = await Promise.all([
        supabase.from("workout_logs").select("calories_burned, logged_at").eq("user_id", user.id).gte("logged_at", thirtyDaysAgo),
        supabase.from("water_logs").select("amount_ml, logged_at").eq("user_id", user.id).gte("logged_at", thirtyDaysAgo),
        supabase.from("food_logs").select("calories, logged_at").eq("user_id", user.id).gte("logged_at", thirtyDaysAgo),
        supabase.from("profiles").select("workout_streak, water_streak, total_workouts, is_premium").eq("user_id", user.id).single(),
      ]);

      if (profileRes.data) {
        setWorkoutStreak((profileRes.data as any).workout_streak ?? 0);
        setWaterStreak((profileRes.data as any).water_streak ?? 0);
        setTotalWorkouts((profileRes.data as any).total_workouts ?? 0);
        setIsPremium((profileRes.data as any).is_premium ?? false);
      }

      const days: Record<string, DailyData> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        days[key] = { date: key, label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), calories: 0, water: 0, workouts: 0 };
      }

      workoutRes.data?.forEach((w) => { const k = new Date(w.logged_at).toISOString().slice(0, 10); if (days[k]) { days[k].calories += w.calories_burned; days[k].workouts += 1; } });
      foodRes.data?.forEach((f) => { const k = new Date(f.logged_at).toISOString().slice(0, 10); if (days[k]) days[k].calories += f.calories; });
      waterRes.data?.forEach((w) => { const k = new Date(w.logged_at).toISOString().slice(0, 10); if (days[k]) days[k].water += w.amount_ml; });

      setDailyData(Object.values(days));
    };
    fetchData();
  }, [user]);

  const chartData = range === "daily" ? dailyData.slice(-7) : range === "weekly" ? dailyData.slice(-14) : dailyData;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-lg mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">GymPlanner</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><Home className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/tracking")}><Activity className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

        {/* Range Tabs */}
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? "default" : "outline"}
              className="rounded-xl capitalize"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="calories"><Flame className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="water"><Droplets className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="streak"><TrendingUp className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="workouts"><Dumbbell className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="calories" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-3">🔥 Calories</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-3">💧 Water</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="water" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streak" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-5 text-center">
                  <TrendingUp className="w-10 h-10 text-success mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{workoutStreak}</p>
                  <p className="text-sm text-muted-foreground">🔥 Workout Streak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <Droplets className="w-10 h-10 text-accent mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{waterStreak}</p>
                  <p className="text-sm text-muted-foreground">💧 Water Streak</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-3">Daily Workouts</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-3">🏋️ Workout Frequency</h3>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-foreground">{totalWorkouts}</p>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="workouts" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Premium */}
        {!isPremium && (
          <Card className="border-premium/30 bg-premium/5">
            <CardContent className="p-5 text-center space-y-3">
              <Crown className="w-8 h-8 text-premium mx-auto" />
              <h3 className="font-bold text-foreground">Unlock Premium</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✔ Unlimited plans & downloads</p>
                <p>✔ Advanced analytics</p>
                <p>✔ Smart AI adjustments</p>
                <p>✔ No ads</p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <Button className="bg-premium text-premium-foreground hover:bg-premium/90 rounded-xl">
                  <Crown className="w-4 h-4 mr-1" /> Upgrade Now
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">Maybe Later</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
