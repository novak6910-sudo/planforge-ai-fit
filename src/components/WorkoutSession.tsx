import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Timer,
  Droplets,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { WorkoutDay, Exercise } from "@/lib/workout-data";

interface WorkoutSessionProps {
  day: WorkoutDay;
  userWeight: number;
  onFinish: (log: {
    completedExercises: string[];
    totalMinutes: number;
    caloriesBurned: number;
    waterMl: number;
  }) => void;
  onBack: () => void;
}

export default function WorkoutSession({
  day,
  userWeight,
  onFinish,
  onBack,
}: WorkoutSessionProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [waterMl, setWaterMl] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(true);
  const [restTimer, setRestTimer] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [activeRestExercise, setActiveRestExercise] = useState<string | null>(null);

  // Session timer
  useEffect(() => {
    if (!sessionRunning) return;
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [sessionRunning]);

  // Rest timer
  useEffect(() => {
    if (!restRunning || restTimer <= 0) return;
    const id = setInterval(() => {
      setRestTimer((t) => {
        if (t <= 1) {
          setRestRunning(false);
          setActiveRestExercise(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRunning, restTimer]);

  const toggleExercise = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRest = (exercise: Exercise) => {
    setRestTimer(exercise.restSeconds);
    setRestRunning(true);
    setActiveRestExercise(exercise.id);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalCalories = day.exercises
    .filter((e) => completed.has(e.id))
    .reduce((sum, e) => sum + e.caloriesPerSet * e.sets * (userWeight / 70), 0);

  const progress = day.exercises.length > 0
    ? (completed.size / day.exercises.length) * 100
    : 0;

  const handleFinish = () => {
    setSessionRunning(false);
    onFinish({
      completedExercises: Array.from(completed),
      totalMinutes: Math.round(sessionSeconds / 60),
      caloriesBurned: Math.round(totalCalories),
      waterMl,
    });
  };

  return (
    <section className="min-h-screen py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h2 className="text-xl font-bold text-foreground">
            {day.day}: {day.focus}
          </h2>
          <div />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Timer, label: "Time", value: formatTime(sessionSeconds), color: "text-primary" },
            { icon: Flame, label: "Calories", value: `${Math.round(totalCalories)}`, color: "text-destructive" },
            { icon: Droplets, label: "Water", value: `${waterMl}ml`, color: "text-glow-soft" },
            { icon: Check, label: "Done", value: `${completed.size}/${day.exercises.length}`, color: "text-success" },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Water tracker */}
        <Card className="p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-glow-soft" />
            <span className="font-medium text-foreground">Water Intake</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWaterMl((w) => Math.max(0, w - 250))}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-foreground w-16 text-center">
              {waterMl}ml
            </span>
            <button
              onClick={() => setWaterMl((w) => w + 250)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </Card>

        {/* Rest Timer */}
        {restRunning && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <Card className="p-6 text-center border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">Rest Timer</p>
              <div className="text-4xl font-bold text-primary mb-3">
                {formatTime(restTimer)}
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRestRunning(false)}
                >
                  <Pause className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRestTimer(0);
                    setRestRunning(false);
                    setActiveRestExercise(null);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Exercises */}
        <div className="space-y-3">
          {day.exercises.map((exercise) => {
            const isDone = completed.has(exercise.id);
            return (
              <Card
                key={exercise.id}
                className={`p-4 transition-all ${
                  isDone ? "bg-success/10 border-success/30" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleExercise(exercise.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isDone
                        ? "bg-success border-success text-success-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">
                      {exercise.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.sets} sets × {exercise.reps} · {exercise.muscleGroup}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startRest(exercise)}
                    disabled={restRunning}
                    className="gap-1 shrink-0"
                  >
                    <Timer className="w-3.5 h-3.5" /> {exercise.restSeconds}s
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Finish */}
        <Button
          onClick={handleFinish}
          size="lg"
          className="w-full mt-8 text-lg py-6 bg-success text-success-foreground hover:bg-success/90"
        >
          Finish Workout 🎉
        </Button>
      </div>
    </section>
  );
}
