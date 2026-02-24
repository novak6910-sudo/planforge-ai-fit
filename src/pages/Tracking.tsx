import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Droplets, Flame, Dumbbell, Home, BarChart3, LogOut, Plus, Minus, TrendingUp, Activity,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import GoalEditor from "@/components/GoalEditor";

export default function Tracking() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [todayWater, setTodayWater] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [waterStreak, setWaterStreak] = useState(0);
  const [customWater, setCustomWater] = useState("");
  const [showCustomWater, setShowCustomWater] = useState(false);
  const [customWaterRemove, setCustomWaterRemove] = useState("");
  const [showCustomWaterRemove, setShowCustomWaterRemove] = useState(false);
  const [customCalorie, setCustomCalorie] = useState("");
  const [showCustomCalorie, setShowCustomCalorie] = useState(false);
  const [customCalorieRemove, setCustomCalorieRemove] = useState("");
  const [showCustomCalorieRemove, setShowCustomCalorieRemove] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const fetchAll = async () => {
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [waterRes, foodRes, profileRes] = await Promise.all([
      supabase.from("water_logs").select("amount_ml").eq("user_id", user.id).gte("logged_at", todayStart.toISOString()),
      supabase.from("food_logs").select("calories").eq("user_id", user.id).gte("logged_at", todayStart.toISOString()),
      supabase.from("profiles").select("daily_water_goal, daily_calorie_goal, workout_streak, water_streak").eq("user_id", user.id).single(),
    ]);

    if (waterRes.data) setTodayWater(waterRes.data.reduce((s, w) => s + w.amount_ml, 0));
    if (foodRes.data) setTodayCalories(foodRes.data.reduce((s, f) => s + f.calories, 0));
    if (profileRes.data) {
      setWaterGoal((profileRes.data as any).daily_water_goal ?? 2500);
      setCalorieGoal((profileRes.data as any).daily_calorie_goal ?? 2000);
      setWorkoutStreak((profileRes.data as any).workout_streak ?? 0);
      setWaterStreak((profileRes.data as any).water_streak ?? 0);
    }
  };

  useEffect(() => { fetchAll(); }, [user]);

  const waterPercent = Math.min(100, (Math.max(0, todayWater) / waterGoal) * 100);

  const updateGoal = async (field: string, value: number) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ [field]: value }).eq("user_id", user.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (field === "daily_water_goal") setWaterGoal(value);
    if (field === "daily_calorie_goal") setCalorieGoal(value);
    toast({ title: "Goal updated ✅" });
  };

  const addWater = async (ml: number) => {
    if (!user || ml <= 0) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: user.id, amount_ml: ml });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `+${ml}ml 💧` });
    fetchAll();
  };

  const removeWater = async (ml: number) => {
    if (!user || ml <= 0) return;
    const { error } = await supabase.from("water_logs").insert({ user_id: user.id, amount_ml: -ml });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `-${ml}ml 💧` });
    fetchAll();
  };

  const addCalories = async (amount: number) => {
    if (!user || amount <= 0) return;
    const { error } = await supabase.from("food_logs").insert({
      user_id: user.id, food_name: `Manual +${amount} kcal`, calories: amount, protein_g: 0, carbs_g: 0, fat_g: 0,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `+${amount} kcal 🔥` });
    fetchAll();
  };

  const removeCalories = async (amount: number) => {
    if (!user || amount <= 0) return;
    const { error } = await supabase.from("food_logs").insert({
      user_id: user.id, food_name: `Manual -${amount} kcal`, calories: -amount, protein_g: 0, carbs_g: 0, fat_g: 0,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `-${amount} kcal 🔥` });
    fetchAll();
  };

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
            <Button variant="ghost" size="icon" onClick={() => navigate("/analytics")}><BarChart3 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate("/"); }}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Tracking</h1>

        {/* 💧 Water Section */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-6 h-6 text-accent" />
                <span className="font-semibold text-foreground text-lg">Water</span>
              </div>
              <GoalEditor label="Goal" value={waterGoal} unit="ml" onSave={(v) => updateGoal("daily_water_goal", v)} />
            </div>

            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{(Math.max(0, todayWater) / 1000).toFixed(1)}L <span className="text-lg text-muted-foreground">/ {(waterGoal / 1000).toFixed(1)}L</span></p>
            </div>
            <Progress value={waterPercent} className="h-3" />
            {waterPercent >= 100 && <p className="text-center text-success font-medium text-sm">🎉 Goal reached!</p>}

            {/* Add */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => addWater(250)}><Plus className="w-3 h-3 mr-1" />250ml</Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => addWater(500)}><Plus className="w-3 h-3 mr-1" />500ml</Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowCustomWater(!showCustomWater)}><Plus className="w-3 h-3 mr-1" />Custom</Button>
            </div>
            {showCustomWater && (
              <div className="flex gap-2">
                <Input type="number" placeholder="ml" value={customWater} onChange={(e) => setCustomWater(e.target.value)} className="w-24 rounded-xl" />
                <Button size="sm" className="rounded-xl" onClick={() => { addWater(Number(customWater) || 0); setCustomWater(""); setShowCustomWater(false); }}>Add</Button>
              </div>
            )}

            {/* Remove */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => removeWater(250)}><Minus className="w-3 h-3 mr-1" />250ml</Button>
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => removeWater(500)}><Minus className="w-3 h-3 mr-1" />500ml</Button>
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => setShowCustomWaterRemove(!showCustomWaterRemove)}><Minus className="w-3 h-3 mr-1" />Custom</Button>
            </div>
            {showCustomWaterRemove && (
              <div className="flex gap-2">
                <Input type="number" placeholder="ml" value={customWaterRemove} onChange={(e) => setCustomWaterRemove(e.target.value)} className="w-24 rounded-xl" />
                <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => { removeWater(Number(customWaterRemove) || 0); setCustomWaterRemove(""); setShowCustomWaterRemove(false); }}>Remove</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🔥 Calories Section */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-destructive" />
                <span className="font-semibold text-foreground text-lg">Calories</span>
              </div>
              <GoalEditor label="Goal" value={calorieGoal} unit="kcal" onSave={(v) => updateGoal("daily_calorie_goal", v)} />
            </div>

            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{todayCalories} <span className="text-lg text-muted-foreground">kcal</span></p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => addCalories(100)}><Plus className="w-3 h-3 mr-1" />100 kcal</Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => addCalories(250)}><Plus className="w-3 h-3 mr-1" />250 kcal</Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowCustomCalorie(!showCustomCalorie)}><Plus className="w-3 h-3 mr-1" />Custom</Button>
            </div>
            {showCustomCalorie && (
              <div className="flex gap-2">
                <Input type="number" placeholder="kcal" value={customCalorie} onChange={(e) => setCustomCalorie(e.target.value)} className="w-24 rounded-xl" />
                <Button size="sm" className="rounded-xl" onClick={() => { addCalories(Number(customCalorie) || 0); setCustomCalorie(""); setShowCustomCalorie(false); }}>Add</Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => removeCalories(100)}><Minus className="w-3 h-3 mr-1" />100 kcal</Button>
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => removeCalories(250)}><Minus className="w-3 h-3 mr-1" />250 kcal</Button>
              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30" onClick={() => setShowCustomCalorieRemove(!showCustomCalorieRemove)}><Minus className="w-3 h-3 mr-1" />Custom</Button>
            </div>
            {showCustomCalorieRemove && (
              <div className="flex gap-2">
                <Input type="number" placeholder="kcal" value={customCalorieRemove} onChange={(e) => setCustomCalorieRemove(e.target.value)} className="w-24 rounded-xl" />
                <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => { removeCalories(Number(customCalorieRemove) || 0); setCustomCalorieRemove(""); setShowCustomCalorieRemove(false); }}>Remove</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 📊 Quick Stats */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="cursor-pointer rounded-xl border border-border p-4 text-center hover:border-success/50 transition-all" onClick={() => navigate("/analytics?tab=streak")}>
                <p className="text-2xl font-bold text-foreground">{workoutStreak}</p>
                <p className="text-sm text-muted-foreground">🏋️ Workout Streak</p>
              </div>
              <div className="cursor-pointer rounded-xl border border-border p-4 text-center hover:border-accent/50 transition-all" onClick={() => navigate("/analytics?tab=water")}>
                <p className="text-2xl font-bold text-foreground">{waterStreak}</p>
                <p className="text-sm text-muted-foreground">💧 Water Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
