import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div
            aria-label="Schmidt Group"
            style={{
              height: "2rem",
              width: "8rem",
              backgroundColor: "var(--primary)",
              maskImage: "url(/logo.png)",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "left center",
              WebkitMaskImage: "url(/logo.png)",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "left center",
            }}
          />

          {/* Nav */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/topics"
              className={({ isActive }) =>
                cn(
                  "relative px-3.5 py-1.5 text-sm rounded-md transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )
              }
            >
              Sujets
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                cn(
                  "relative px-3.5 py-1.5 text-sm rounded-md transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )
              }
            >
              Historique
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
