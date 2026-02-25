import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown, Check, Shield, ArrowLeft,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const benefits = [
  "Unlimited Workout Plans",
  "Unlimited Downloads",
  "Advanced Analytics",
  "Smart AI Adjustments",
  "No Ads",
  "Early Access Features",
];

export default function Premium() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubscribe = (plan: string) => {
    toast({
      title: "Coming soon!",
      description: `${plan} subscription will be available shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto px-6 py-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-premium/20 flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-premium" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Upgrade to Premium</h1>
          <p className="text-muted-foreground">Unlock your full fitness potential</p>
        </div>

        {/* Benefits */}
        <Card>
          <CardContent className="p-5 space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-success" />
                </div>
                <span className="text-foreground font-medium">{b}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="space-y-3">
          {/* Monthly */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Monthly</h3>
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">€3.99</p>
                  <p className="text-xs text-muted-foreground">/ month</p>
                </div>
              </div>
              <Button
                onClick={() => handleSubscribe("Monthly")}
                className="w-full rounded-xl h-12"
              >
                Start Premium
              </Button>
            </CardContent>
          </Card>

          {/* Yearly (highlighted) */}
          <Card className="border-2 border-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
              🔥 Best Value
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground text-lg">Yearly</h3>
                  <p className="text-sm text-success font-medium">Save 37%</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">€29.99</p>
                  <p className="text-xs text-muted-foreground">/ year</p>
                </div>
              </div>
              <Button
                onClick={() => handleSubscribe("Yearly")}
                className="w-full rounded-xl h-12 bg-success text-success-foreground hover:bg-success/90"
              >
                Get Yearly Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-4 h-4" /> Secure payment · Cancel anytime
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
