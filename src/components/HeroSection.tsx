import { motion } from "framer-motion";
import { Dumbbell, Zap, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const features = [
  { icon: Zap, label: "AI-Powered Plans" },
  { icon: Dumbbell, label: "Editable Workouts" },
  { icon: Clock, label: "Built-in Timers" },
  { icon: BarChart3, label: "Progress Tracking" },
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Fitness background"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 hero-gradient opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-primary-foreground border border-primary/30 mb-6">
            Your Personal AI Trainer
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-primary-foreground leading-tight mb-6 glow-text">
            Train Smarter.
            <br />
            <span className="text-glow-soft">Get Stronger.</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            AI-generated workout plans tailored to your goals, equipment, and
            experience level. Edit, track, and crush your fitness journey.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
            >
              Generate My Plan
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              View Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass rounded-xl p-4 flex flex-col items-center gap-2"
            >
              <f.icon className="w-6 h-6 text-glow-soft" />
              <span className="text-sm font-medium text-primary-foreground/80">
                {f.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
