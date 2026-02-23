import { Dumbbell, BarChart3, FileText, Crown } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isPaid: boolean;
}

export default function Navbar({ currentView, onNavigate, isPaid }: NavbarProps) {
  const links = [
    { id: "home", label: "Home", icon: Dumbbell },
    { id: "plan", label: "My Plan", icon: FileText },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-lg text-foreground"
        >
          <Dumbbell className="w-6 h-6 text-primary" />
          GymPlanner
        </button>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === link.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <link.icon className="w-4 h-4 inline mr-1.5" />
              <span className="hidden sm:inline">{link.label}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate("upgrade")}
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPaid
                ? "bg-premium/10 text-premium"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Crown className="w-4 h-4 inline mr-1" />
            <span className="hidden sm:inline">{isPaid ? "Pro" : "Upgrade"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
