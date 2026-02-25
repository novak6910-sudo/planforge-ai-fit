import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Edit3, Trash2, Plus, Crown, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import type { WorkoutPlan } from "@/lib/workout-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const MAX_FREE_PLANS = 2;

export default function Plans() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  // Load plans from localStorage
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`plans_${user.id}`);
    if (stored) {
      try { setPlans(JSON.parse(stored)); } catch { /* ignore */ }
    }
    // Check premium
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.from("profiles").select("is_premium").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setIsPremium((data as any).is_premium ?? false);
      });
    });
  }, [user]);

  const savePlans = (updated: WorkoutPlan[]) => {
    setPlans(updated);
    if (user) localStorage.setItem(`plans_${user.id}`, JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    savePlans(plans.filter((p) => p.id !== id));
    setDeleteId(null);
    toast({ title: "Plan deleted 🗑" });
  };

  const handleCreate = () => {
    if (!isPremium && plans.length >= MAX_FREE_PLANS) {
      setShowLimitPopup(true);
      return;
    }
    navigate("/create");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-lg mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Plans</h1>
          <Button size="sm" onClick={handleCreate} className="rounded-xl gap-1">
            <Plus className="w-4 h-4" /> New Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">No workout plans yet.</p>
              <Button onClick={handleCreate} className="rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.goal} · {plan.daysPerWeek} days/week
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate("/create", { state: { plan } })}
                      className="flex-1 rounded-xl gap-1"
                    >
                      <Play className="w-4 h-4" /> Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/create", { state: { plan, edit: true } })}
                      className="rounded-xl gap-1"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(plan.id)}
                      className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isPremium && (
          <p className="text-center text-sm text-muted-foreground">
            {plans.length}/{MAX_FREE_PLANS} free plans used
          </p>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this plan?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Free plan limit popup */}
      <Dialog open={showLimitPopup} onOpenChange={setShowLimitPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-premium" /> Plan Limit Reached
            </DialogTitle>
            <DialogDescription>
              You've reached your {MAX_FREE_PLANS} plan limit. Upgrade to Premium for unlimited plans.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => navigate("/premium")} className="flex-1 rounded-xl gap-1">
              <Crown className="w-4 h-4" /> Upgrade to Premium
            </Button>
            <Button variant="outline" onClick={() => setShowLimitPopup(false)} className="rounded-xl">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
