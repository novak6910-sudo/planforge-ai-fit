import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, LogOut, Trash2, User, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Account() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, is_premium")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName((data as any).display_name || "");
          setIsPremium((data as any).is_premium ?? false);
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Account deletion requested",
      description: "Please contact support to complete account deletion.",
    });
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
        <h1 className="text-2xl font-bold text-foreground">Account</h1>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">{displayName || "Athlete"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Subscription</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${isPremium ? "text-premium" : "text-muted-foreground"}`} />
                <span className="font-medium text-foreground">
                  {isPremium ? "Premium" : "Free Plan"}
                </span>
              </div>
              {isPremium ? (
                <span className="text-xs bg-premium/20 text-premium px-2.5 py-1 rounded-full font-medium">Active</span>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigate("/premium")}
                  className="rounded-xl gap-1"
                >
                  <Crown className="w-4 h-4" /> Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignOut}
            className="w-full h-12 rounded-xl gap-3 justify-start"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Log Out</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-xl gap-3 justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
