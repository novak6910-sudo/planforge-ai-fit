import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Target, User, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UserProfile } from "@/lib/workout-data";

interface PlannerFormProps {
  onGenerate: (profile: UserProfile) => void;
}

const goals = [
  { value: "bulk" as const, label: "Bulk", desc: "Build muscle mass" },
  { value: "cut" as const, label: "Cut", desc: "Burn fat, stay lean" },
  { value: "maintain" as const, label: "Maintain", desc: "Stay in shape" },
];

const levels = [
  { value: "beginner" as const, label: "Beginner", desc: "< 6 months training" },
  { value: "intermediate" as const, label: "Intermediate", desc: "6+ months training" },
];

const equipmentOptions = [
  { value: "dumbbells", label: "Dumbbells" },
  { value: "resistance bands", label: "Resistance Bands" },
  { value: "gym", label: "Full Gym" },
];

const timeOptions = [30, 45, 60, 90];

export default function PlannerForm({ onGenerate }: PlannerFormProps) {
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [goal, setGoal] = useState<UserProfile["goal"]>("bulk");
  const [level, setLevel] = useState<UserProfile["level"]>("beginner");
  const [equipment, setEquipment] = useState<string[]>(["dumbbells"]);
  const [workoutMinutes, setWorkoutMinutes] = useState(45);

  const toggleEquipment = (eq: string) =>
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );

  const handleSubmit = () => {
    onGenerate({ age, weight, height, goal, level, equipment, workoutMinutes });
  };

  return (
    <section id="planner" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Build Your Plan
          </h2>
          <p className="text-muted-foreground text-lg">
            Tell us about yourself and we'll create the perfect workout plan.
          </p>
        </motion.div>

        <Card className="p-6 md:p-8 card-glow">
          {/* Personal Info */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Personal Info</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Age", value: age, set: setAge, min: 14, max: 80, unit: "yrs" },
                { label: "Weight", value: weight, set: setWeight, min: 30, max: 200, unit: "kg" },
                { label: "Height", value: height, set: setHeight, min: 100, max: 230, unit: "cm" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-sm text-muted-foreground block mb-1">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.set(Number(e.target.value))}
                      min={field.min}
                      max={field.max}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">{field.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Fitness Goal</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {goals.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    goal === g.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-semibold">{g.label}</div>
                  <div className="text-xs mt-1">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Experience Level</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {levels.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    level === l.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <div className="font-semibold">{l.label}</div>
                  <div className="text-xs mt-1">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Available Equipment</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {equipmentOptions.map((eq) => (
                <button
                  key={eq.value}
                  onClick={() => toggleEquipment(eq.value)}
                  className={`rounded-full px-5 py-2 border-2 text-sm font-medium transition-all ${
                    equipment.includes(eq.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Workout Duration</h3>
            </div>
            <div className="flex gap-3">
              {timeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setWorkoutMinutes(t)}
                  className={`rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all ${
                    workoutMinutes === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={equipment.length === 0}
            className="w-full text-lg py-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
          >
            Generate My Plan <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
