import { useState } from "react";
import { useLocation } from "react-router-dom"; // Fix the import
import DashboardIcon from "@/assets/dashboardIcon.svg?react";
import MapIcon from "@/assets/mapIcon.svg?react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type View = "dashboard" | "map";

interface SidebarProps {
  onViewChange?: (view: View) => void;
}

export function Sidebar({ onViewChange }: SidebarProps) {
  const location = useLocation();
  const [activeView, setActiveView] = useState<View>("map");

  const handleViewChange = (view: View) => {
    setActiveView(view);
    onViewChange?.(view);
  };

  const navItems = [
    {
      id: "dashboard" as View,
      icon: DashboardIcon,
      label: "DASHBOARD",
      routeTo: "/dashboard",
    },
    {
      id: "map" as View,
      icon: MapIcon,
      label: "MAP",
      routeTo: "/",
    },
  ];

  return (
    <aside className="bg-black w-fit h-full border-r border-[#272727]">
      <div className="flex flex-col py-6 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Check if current route matches the item's route
          const isActive = location.pathname === item.routeTo;

          return (
            <Link key={item.id} to={item.routeTo}>
              <button
                onClick={() => handleViewChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center py-4 px-2",
                  "transition-all duration-200",
                  "hover:bg-[#272727]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                  isActive ? "bg-[#272727]" : "transparent",
                  "w-full"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                )}
                <div
                  className={cn(
                    "flex flex-col items-center gap-0",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className="h-12 w-12 flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[15px] tracking-wider font-[400]">
                    {item.label}
                  </span>
                </div>
              </button>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
