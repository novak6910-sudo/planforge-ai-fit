import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dumbbell, Droplets, Flame, Home, Activity, LogOut, TrendingUp, BarChart3, Crown, Lock,
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

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // Get 30 days of data
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

      // Build daily aggregates
      const days: Record<string, DailyData> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        days[key] = {
          date: key,
          label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
          calories: 0, water: 0, workouts: 0,
        };
      }

      workoutRes.data?.forEach((w) => {
        const key = new Date(w.logged_at).toISOString().slice(0, 10);
        if (days[key]) { days[key].calories += w.calories_burned; days[key].workouts += 1; }
      });
      foodRes.data?.forEach((f) => {
        const key = new Date(f.logged_at).toISOString().slice(0, 10);
        if (days[key]) days[key].calories += f.calories;
      });
      waterRes.data?.forEach((w) => {
        const key = new Date(w.logged_at).toISOString().slice(0, 10);
        if (days[key]) days[key].water += w.amount_ml;
      });

      setDailyData(Object.values(days));
    };
    fetch();
  }, [user]);

  const last7 = dailyData.slice(-7);
  const last30 = dailyData;

  // Weekly comparison: this week vs last week
  const thisWeekCals = last7.reduce((s, d) => s + d.calories, 0);
  const lastWeekData = dailyData.slice(-14, -7);
  const lastWeekCals = lastWeekData.reduce((s, d) => s + d.calories, 0);
  const calChange = lastWeekCals > 0 ? Math.round(((thisWeekCals - lastWeekCals) / lastWeekCals) * 100) : 0;

  const thisWeekWater = last7.reduce((s, d) => s + d.water, 0);
  const lastWeekWater = lastWeekData.reduce((s, d) => s + d.water, 0);
  const waterChange = lastWeekWater > 0 ? Math.round(((thisWeekWater - lastWeekWater) / lastWeekWater) * 100) : 0;

  const thisWeekWorkouts = last7.reduce((s, d) => s + d.workouts, 0);
  const lastWeekWorkoutsCount = lastWeekData.reduce((s, d) => s + d.workouts, 0);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">GymPlanner</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><Home className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tracking")}><Activity className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Analytics</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Flame className="w-6 h-6 text-destructive mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{thisWeekCals}</p>
              <p className="text-xs text-muted-foreground">Calories This Week</p>
              {calChange !== 0 && <p className={`text-xs font-medium mt-1 ${calChange > 0 ? "text-success" : "text-destructive"}`}>{calChange > 0 ? "+" : ""}{calChange}% vs last week</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{waterStreak}</p>
              <p className="text-xs text-muted-foreground">Water Streak 💧</p>
              {waterChange !== 0 && <p className={`text-xs font-medium mt-1 ${waterChange > 0 ? "text-success" : "text-destructive"}`}>{waterChange > 0 ? "+" : ""}{waterChange}% intake</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{workoutStreak}</p>
              <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Dumbbell className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Total Workouts</p>
              <p className="text-xs text-muted-foreground mt-1">This week: {thisWeekWorkouts}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="calories" className="gap-1"><Flame className="w-4 h-4" /> Calories</TabsTrigger>
            <TabsTrigger value="water" className="gap-1"><Droplets className="w-4 h-4" /> Water</TabsTrigger>
            <TabsTrigger value="streak" className="gap-1"><TrendingUp className="w-4 h-4" /> Streaks</TabsTrigger>
            <TabsTrigger value="workouts" className="gap-1"><Dumbbell className="w-4 h-4" /> Workouts</TabsTrigger>
          </TabsList>

          {/* CALORIES */}
          <TabsContent value="calories" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Daily Calories (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Calories" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Monthly Calorie Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Area type="monotone" dataKey="calories" fill="hsl(var(--destructive) / 0.2)" stroke="hsl(var(--destructive))" name="Calories" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <PerformanceSummary label="Calories" thisWeek={thisWeekCals} lastWeek={lastWeekCals} unit="kcal" />
          </TabsContent>

          {/* WATER */}
          <TabsContent value="water" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Daily Water Intake (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="water" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Water (ml)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Monthly Hydration Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Line type="monotone" dataKey="water" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Water (ml)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <PerformanceSummary label="Water" thisWeek={thisWeekWater} lastWeek={lastWeekWater} unit="ml" />
          </TabsContent>

          {/* STREAKS */}
          <TabsContent value="streak" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center space-y-2">
                  <TrendingUp className="w-10 h-10 text-success mx-auto" />
                  <p className="text-4xl font-bold text-foreground">{workoutStreak}</p>
                  <p className="text-sm text-muted-foreground">Workout Day Streak 🔥</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center space-y-2">
                  <Droplets className="w-10 h-10 text-accent mx-auto" />
                  <p className="text-4xl font-bold text-foreground">{waterStreak}</p>
                  <p className="text-sm text-muted-foreground">Water Streak 💧</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-sm">Daily Workouts (Last 30 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WORKOUTS */}
          <TabsContent value="workouts" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Workout Frequency (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Monthly Workout Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="workouts" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" name="Workouts" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{thisWeekWorkouts}</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{lastWeekWorkoutsCount}</p>
                  <p className="text-xs text-muted-foreground">Last Week</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Premium section */}
        {!isPremium && (
          <Card className="border-premium/30 bg-premium/5">
            <CardContent className="pt-6 text-center space-y-3">
              <Crown className="w-8 h-8 text-premium mx-auto" />
              <h3 className="font-bold text-foreground">Unlock Premium Analytics</h3>
              <p className="text-sm text-muted-foreground">Advanced analytics, predictive trends, and AI-powered progress insights.</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Advanced Analytics</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Predictive Trends</span>
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> AI Progress Insights</span>
              </div>
              <Button className="bg-premium text-premium-foreground hover:bg-premium/90">
                <Crown className="w-4 h-4 mr-1" /> Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function PerformanceSummary({ label, thisWeek, lastWeek, unit }: { label: string; thisWeek: number; lastWeek: number; unit: string }) {
  const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Performance Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{thisWeek.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">This Week ({unit})</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{lastWeek.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Last Week ({unit})</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${change >= 0 ? "text-success" : "text-destructive"}`}>{change >= 0 ? "+" : ""}{change}%</p>
            <p className="text-xs text-muted-foreground">Change</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
