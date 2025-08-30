import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import DronesListTitle from "@/assets/dronesListTitle.svg?react";
import CloseIcon from "@/assets/closeIcon.svg?react";
import { Menu, X } from "lucide-react";

interface DroneSelectorLayoutProps {
  children: ReactNode;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const DroneSelectorLayout = ({
  children,
  title = "DRONE FLYING",
  onClose,
  className,
}: DroneSelectorLayoutProps) => {
  const [activeTab, setActiveTab] = useState<"drones" | "history">("drones");
  const [isToggled, setToggle] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const handleHeaderClick = () => {
    if (!isToggled) {
      setToggle(true);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggled) {
      setToggle(false);
    }
  };

  return (
    <>
      {/* Mobile toggle button - only visible on small screens when sidebar is closed */}
      {!isMobileOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-[#111111] rounded-full p-2"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}

      <div
        className={cn(
          "bg-[#111111] text-white flex flex-col transition-all duration-300 ease-in-out",
          "lg:w-[334px]",
          "md:w-[300px]",
          "w-[280px]",
          isToggled ? "h-full" : "h-fit",
          // Hide completely on mobile when closed
          !isMobileOpen && "hidden lg:flex",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between p-4 transition-colors duration-200 flex-shrink-0",
            !isToggled && "cursor-pointer hover:bg-black"
          )}
          onClick={handleHeaderClick}
        >
          <DronesListTitle />
          <div className="flex gap-2">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden w-6 h-6 flex items-center justify-center hover:bg-transparent rounded transition-opacity duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            {(onClose || isToggled) && (
              <button
                onClick={handleCloseClick}
                className="hidden lg:flex w-6 h-6 items-center justify-center hover:bg-transparent rounded hover:cursor-pointer transition-opacity duration-200"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {isToggled && (
          <>
            <div className="flex border-b border-[#0B0B0B] flex-shrink-0">
              <button
                onClick={() => setActiveTab("drones")}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-all duration-200",
                  activeTab === "drones"
                    ? "border-b-2 border-red-500 text-white"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                Drones
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-all duration-200",
                  activeTab === "history"
                    ? "border-b-2 border-red-500 text-white"
                    : "text-gray-400 hover:text-gray-300"
                )}
              >
                Flights History
              </button>
            </div>

            <ScrollArea className="flex-1 h-0" scrollHideDelay={0}>
              {activeTab === "drones" ? (
                children
              ) : (
                <div className="p-4 text-offWhite">
                  No flights history to display
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </>
  );
};

export default DroneSelectorLayout;