import { Drone } from "lucide-react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="relative animate-bounce">
            <div className="absolute inset-0 -m-8">
              <div className="w-32 h-32 rounded-full bg-[#ffff] animate-ping" />
            </div>
            <Drone
              size={64}
              className="text-[#ffff] drone-spin"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 text-white/80">
          <span className="text-lg font-medium">Loading</span>
          <span className="flex gap-1">
            <span className="dot-bounce dot-1">.</span>
            <span className="dot-bounce dot-2">.</span>
            <span className="dot-bounce dot-3">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
