import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets, Flame, Apple, Plus, Trash2, Dumbbell,
  Home, BarChart3, LogOut, Crown, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface WaterLog { id: string; amount_ml: number; logged_at: string }
interface FoodLog { id: string; food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; logged_at: string }
interface WorkoutLog { id: string; calories_burned: number; total_minutes: number; logged_at: string }

export default function Tracking() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [foodForm, setFoodForm] = useState({ food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const fetchAll = async () => {
    if (!user) return;
    const [w, f, wk] = await Promise.all([
      supabase.from("water_logs").select("id, amount_ml, logged_at").eq("user_id", user.id).gte("logged_at", todayISO).order("logged_at", { ascending: false }),
      supabase.from("food_logs").select("id, food_name, calories, protein_g, carbs_g, fat_g, logged_at").eq("user_id", user.id).gte("logged_at", todayISO).order("logged_at", { ascending: false }),
      supabase.from("workout_logs").select("id, calories_burned, total_minutes, logged_at").eq("user_id", user.id).gte("logged_at", new Date(Date.now() - 7 * 86400000).toISOString()).order("logged_at", { ascending: true }),
    ]);
    if (w.data) setWaterLogs(w.data);
    if (f.data) setFoodLogs(f.data);
    if (wk.data) setWorkoutLogs(wk.data);
  };

  useEffect(() => { fetchAll(); }, [user]);

  // Water
  const todayWater = waterLogs.reduce((s, l) => s + l.amount_ml, 0);
  const waterGoal = 2500;
  const waterPercent = Math.min(100, (todayWater / waterGoal) * 100);

  const addWater = async (ml: number) => {
    if (!user) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: user.id, amount_ml: ml });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `+${ml}ml 💧` });
    fetchAll();
  };

  // Food
  const todayCaloriesIn = foodLogs.reduce((s, f) => s + f.calories, 0);
  const todayProtein = foodLogs.reduce((s, f) => s + Number(f.protein_g), 0);
  const todayCarbs = foodLogs.reduce((s, f) => s + Number(f.carbs_g), 0);
  const todayFat = foodLogs.reduce((s, f) => s + Number(f.fat_g), 0);

  const addFood = async () => {
    if (!user || !foodForm.food_name) return;
    const { error } = await supabase.from("food_logs").insert({
      user_id: user.id,
      food_name: foodForm.food_name,
      calories: Number(foodForm.calories) || 0,
      protein_g: Number(foodForm.protein_g) || 0,
      carbs_g: Number(foodForm.carbs_g) || 0,
      fat_g: Number(foodForm.fat_g) || 0,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setFoodForm({ food_name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "" });
    setShowFoodForm(false);
    toast({ title: "Food logged 🍎" });
    fetchAll();
  };

  const deleteFood = async (id: string) => {
    await supabase.from("food_logs").delete().eq("id", id);
    fetchAll();
  };

  // Calories burned
  const todayCaloriesBurned = workoutLogs
    .filter((w) => new Date(w.logged_at) >= todayStart)
    .reduce((s, w) => s + w.calories_burned, 0);

  // Weekly chart data
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weeklyCalories = weekDays.map((day) => {
    const next = new Date(day); next.setDate(next.getDate() + 1);
    const cals = workoutLogs
      .filter((w) => { const d = new Date(w.logged_at); return d >= day && d < next; })
      .reduce((s, w) => s + w.calories_burned, 0);
    return { day: day.toLocaleDateString("en", { weekday: "short" }), calories: cals };
  });

  // Macro pie
  const macroData = [
    { name: "Protein", value: todayProtein, color: "hsl(217, 91%, 50%)" },
    { name: "Carbs", value: todayCarbs, color: "hsl(195, 100%, 50%)" },
    { name: "Fat", value: todayFat, color: "hsl(38, 92%, 50%)" },
  ].filter((m) => m.value > 0);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">GymPlanner</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><Home className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Tracking</h1>

        <Tabs defaultValue="water" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="water" className="gap-1"><Droplets className="w-4 h-4" /> Water</TabsTrigger>
            <TabsTrigger value="calories" className="gap-1"><Flame className="w-4 h-4" /> Calories</TabsTrigger>
            <TabsTrigger value="food" className="gap-1"><Apple className="w-4 h-4" /> Food</TabsTrigger>
          </TabsList>

          {/* WATER */}
          <TabsContent value="water" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="w-5 h-5 text-accent" /> Daily Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{todayWater}<span className="text-lg text-muted-foreground">ml</span></p>
                  <p className="text-sm text-muted-foreground">of {waterGoal}ml goal</p>
                </div>
                <Progress value={waterPercent} className="h-4" />
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => addWater(250)}>+250ml</Button>
                  <Button size="sm" variant="outline" onClick={() => addWater(500)}>+500ml</Button>
                  <Button size="sm" variant="outline" onClick={() => addWater(750)}>+750ml</Button>
                  <Button size="sm" variant="outline" onClick={() => addWater(1000)}>+1L</Button>
                </div>
                {waterPercent >= 100 && (
                  <p className="text-center text-success font-medium">🎉 Goal reached! Great hydration!</p>
                )}
              </CardContent>
            </Card>

            {/* Recent entries */}
            {waterLogs.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Recent</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {waterLogs.slice(0, 5).map((l) => (
                    <div key={l.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(l.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className="font-medium text-foreground">{l.amount_ml}ml</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* CALORIES BURNED */}
          <TabsContent value="calories" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5 text-destructive" /> Calories Burned Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-center text-foreground">{todayCaloriesBurned}<span className="text-lg text-muted-foreground"> kcal</span></p>
                <p className="text-sm text-center text-muted-foreground mt-1">Auto-calculated from workouts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Weekly Burn</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyCalories}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FOOD */}
          <TabsContent value="food" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg"><Apple className="w-5 h-5 text-success" /> Food Intake</span>
                  <Button size="sm" onClick={() => setShowFoodForm(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayCaloriesIn}</p>
                    <p className="text-xs text-muted-foreground">Calories In</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{Math.round(todayProtein)}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                </div>

                {macroData.length > 0 && (
                  <div className="h-40 flex justify-center">
                    <PieChart width={160} height={160}>
                      <Pie data={macroData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${Math.round(value)}g`}>
                        {macroData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Food form */}
            {showFoodForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-sm">
                    Log Food
                    <button onClick={() => setShowFoodForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Food name" value={foodForm.food_name} onChange={(e) => setFoodForm({ ...foodForm, food_name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Calories" value={foodForm.calories} onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })} />
                    <Input type="number" placeholder="Protein (g)" value={foodForm.protein_g} onChange={(e) => setFoodForm({ ...foodForm, protein_g: e.target.value })} />
                    <Input type="number" placeholder="Carbs (g)" value={foodForm.carbs_g} onChange={(e) => setFoodForm({ ...foodForm, carbs_g: e.target.value })} />
                    <Input type="number" placeholder="Fat (g)" value={foodForm.fat_g} onChange={(e) => setFoodForm({ ...foodForm, fat_g: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={addFood}>Save Entry</Button>
                </CardContent>
              </Card>
            )}

            {/* Food list */}
            {foodLogs.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Today's Food</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {foodLogs.map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-foreground">{f.food_name}</p>
                        <p className="text-xs text-muted-foreground">{f.calories} kcal · P:{Math.round(Number(f.protein_g))}g C:{Math.round(Number(f.carbs_g))}g F:{Math.round(Number(f.fat_g))}g</p>
                      </div>
                      <button onClick={() => deleteFood(f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
