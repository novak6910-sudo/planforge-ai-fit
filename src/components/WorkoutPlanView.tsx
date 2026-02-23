import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  RefreshCw,
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkoutPlan, WorkoutDay, Exercise } from "@/lib/workout-data";
import { getAllExercises } from "@/lib/workout-data";

interface WorkoutPlanViewProps {
  plan: WorkoutPlan;
  isPaid: boolean;
  onPlanChange: (plan: WorkoutPlan) => void;
  onStartWorkout: (day: WorkoutDay) => void;
  onDownload: () => void;
}

export default function WorkoutPlanView({
  plan,
  isPaid,
  onPlanChange,
  onStartWorkout,
  onDownload,
}: WorkoutPlanViewProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(plan.days[0]?.id);
  const [replacingExercise, setReplacingExercise] = useState<{
    dayId: string;
    exerciseId: string;
  } | null>(null);

  const removeExercise = (dayId: string, exerciseId: string) => {
    const updated = {
      ...plan,
      days: plan.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
          : d
      ),
    };
    onPlanChange(updated);
  };

  const replaceExercise = (dayId: string, oldId: string, newExercise: Exercise) => {
    const updated = {
      ...plan,
      days: plan.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === oldId ? { ...newExercise, id: newExercise.id + "_r" } : e
              ),
            }
          : d
      ),
    };
    onPlanChange(updated);
    setReplacingExercise(null);
  };

  const getSuggestions = (exercise: Exercise): Exercise[] => {
    return getAllExercises()
      .filter(
        (e) =>
          e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id
      )
      .slice(0, 4);
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {plan.name}
          </h2>
          <p className="text-muted-foreground">
            {plan.daysPerWeek} days/week · {plan.level} · {plan.goal}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button onClick={onDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {plan.days.map((day) => {
            const isExpanded = expandedDay === day.id;
            return (
              <Card key={day.id} className="overflow-hidden card-glow">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {day.day}
                    </h3>
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                      {day.exercises.length} exercises
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        {/* Warmup */}
                        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                          <span className="font-medium text-foreground">
                            Warm-up:
                          </span>{" "}
                          {day.warmup.join(" → ")}
                        </div>

                        {day.exercises.map((exercise) => {
                          const locked = exercise.isPremium && !isPaid;
                          const isReplacing =
                            replacingExercise?.dayId === day.id &&
                            replacingExercise?.exerciseId === exercise.id;

                          return (
                            <div key={exercise.id}>
                              <div
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                  locked
                                    ? "border-premium/30 bg-premium/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">
                                      {locked ? "🔒 Premium Exercise" : exercise.name}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                      {exercise.muscleGroup}
                                    </span>
                                  </div>
                                  {!locked && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {exercise.sets} sets × {exercise.reps} · Rest{" "}
                                      {exercise.restSeconds}s · {exercise.equipment}
                                    </div>
                                  )}
                                </div>
                                {!locked && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() =>
                                        setReplacingExercise(
                                          isReplacing
                                            ? null
                                            : {
                                                dayId: day.id,
                                                exerciseId: exercise.id,
                                              }
                                        )
                                      }
                                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                      title="Replace"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        removeExercise(day.id, exercise.id)
                                      }
                                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {locked && (
                                  <Lock className="w-5 h-5 text-premium" />
                                )}
                              </div>

                              {/* Replacement suggestions */}
                              <AnimatePresence>
                                {isReplacing && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-4 mt-2 space-y-2">
                                      <p className="text-xs text-muted-foreground font-medium">
                                        Suggested replacements:
                                      </p>
                                      {getSuggestions(exercise).map((s) => (
                                        <button
                                          key={s.id}
                                          onClick={() =>
                                            replaceExercise(
                                              day.id,
                                              exercise.id,
                                              s
                                            )
                                          }
                                          className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                                        >
                                          <span className="font-medium text-sm text-foreground">
                                            {s.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground ml-2">
                                            {s.sets}×{s.reps} · {s.equipment}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                        {/* Cooldown */}
                        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                          <span className="font-medium text-foreground">
                            Cool-down:
                          </span>{" "}
                          {day.cooldown.join(" → ")}
                        </div>

                        <Button
                          onClick={() => onStartWorkout(day)}
                          className="w-full mt-2 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Play className="w-4 h-4" /> Start Workout
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>

        {!isPaid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center p-4 rounded-xl bg-premium/10 border border-premium/30"
          >
            <p className="text-sm text-foreground">
              🔒 Some exercises are locked.{" "}
              <button className="font-bold text-primary underline">
                Upgrade to Pro
              </button>{" "}
              for full access & unlimited downloads.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
