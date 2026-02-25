import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PlannerForm from "@/components/PlannerForm";
import WorkoutPlanView from "@/components/WorkoutPlanView";
import WorkoutSession from "@/components/WorkoutSession";
import {
  generateWorkoutPlan,
  type UserProfile,
  type WorkoutPlan,
  type WorkoutDay,
} from "@/lib/workout-data";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

type View = "form" | "plan" | "workout";

export default function Create() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<View>("form");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [userWeight, setUserWeight] = useState(70);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Load passed plan from Plans page
  useEffect(() => {
    const state = location.state as any;
    if (state?.plan) {
      setPlan(state.plan);
      setView("plan");
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_premium, weight").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setIsPaid((data as any).is_premium ?? false);
        setUserWeight((data as any).weight ?? 70);
      }
    });
  }, [user]);

  const handleGenerate = useCallback((profile: UserProfile) => {
    setUserWeight(profile.weight);
    const newPlan = generateWorkoutPlan(profile);
    setPlan(newPlan);
    setView("plan");

    // Auto-save plan
    if (user) {
      const stored = localStorage.getItem(`plans_${user.id}`);
      const existing: WorkoutPlan[] = stored ? JSON.parse(stored) : [];
      existing.push(newPlan);
      localStorage.setItem(`plans_${user.id}`, JSON.stringify(existing));
    }

    toast({
      title: "Plan Generated! 🎯",
      description: `${newPlan.daysPerWeek}-day ${newPlan.goal} plan created and saved.`,
    });
  }, [user]);

  const handleStartWorkout = useCallback((day: WorkoutDay) => {
    setActiveDay(day);
    setView("workout");
  }, []);

  const handleFinishWorkout = useCallback(
    async (result: {
      completedExercises: string[];
      totalMinutes: number;
      caloriesBurned: number;
      waterMl: number;
    }) => {
      if (user) {
        await supabase.from("workout_logs").insert({
          user_id: user.id,
          day_id: activeDay?.id || "",
          day_focus: activeDay?.focus || "",
          completed_exercises: result.completedExercises,
          total_minutes: result.totalMinutes,
          calories_burned: result.caloriesBurned,
          water_ml: result.waterMl,
        });

        if (result.waterMl > 0) {
          await supabase.from("water_logs").insert({
            user_id: user.id,
            amount_ml: result.waterMl,
          });
        }
      }

      setView("plan");
      toast({
        title: "Workout Complete! 🎉",
        description: `${result.completedExercises.length} exercises done · ${result.caloriesBurned} cal burned`,
      });
    },
    [activeDay, user]
  );

  const handleDownload = useCallback(() => {
    toast({ title: "PDF Downloaded 📄", description: "Your workout plan has been saved." });
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {view === "form" && <PlannerForm onGenerate={handleGenerate} />}

      {view === "plan" && plan && (
        <WorkoutPlanView
          plan={plan}
          isPaid={isPaid}
          onPlanChange={setPlan}
          onStartWorkout={handleStartWorkout}
          onDownload={handleDownload}
        />
      )}

      {view === "workout" && activeDay && (
        <WorkoutSession
          day={activeDay}
          userWeight={userWeight}
          onFinish={handleFinishWorkout}
          onBack={() => setView("plan")}
        />
      )}

      {view !== "workout" && <BottomNav />}
    </div>
  );
}
