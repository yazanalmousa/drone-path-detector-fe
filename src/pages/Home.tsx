import AppLayout from "@/components/layout";
import DroneSelectorLayout from "@/components/droneSelectorLayout";
import DroneCard from "@/components/cards/droneCard";
import { lazy, useEffect } from "react";
const MapViewer = lazy(() => import("@/components/mapViewer"));
import { useSocket } from "@/hooks/useSocket";
import { config } from "@/config";
import type { DroneDataType } from "@/types/dronesData";
import { useDroneStore } from "@/stores/droneStore";

function Home() {
  const {
    allDronesData,
    selectedDrone,
    redDroneCount,
    addDroneData,
    setSelectedDrone,
    getUniqueDrones,
  } = useDroneStore();

  const { socket, isConnected, reconnectCount } = useSocket(config.socketUrl);

  useEffect(() => {
    if (!socket) {
      console.log("⚠️ Socket not available yet");
      return;
    }

    console.log(
      "🔗 Setting up message listener, socket connected:",
      socket.connected
    );

    const handleMessage = (data: DroneDataType) => {
      console.log("📨 Received drone data:", data);
      addDroneData(data);
    };

    const handleError = (error: any) => {
      console.error("🔴 Socket error:", error);
    };

    const handleConnect = () => {
      console.log("✅ Socket connected in component");
    };

    const handleDisconnect = (reason: string) => {
      console.log("❌ Socket disconnected in component:", reason);
    };

    socket.on("message", handleMessage);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.onAny((eventName, ...args) => {
      if (eventName !== "connect" && eventName !== "disconnect") {
        console.log("📡 Any event received:", eventName, args);
      }
    });

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("message", handleMessage);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.offAny();
    };
  }, [socket, addDroneData, reconnectCount]);

  const uniqueDrones = getUniqueDrones();

  return (
    <AppLayout>
      <div className="h-full bg-[#000000] relative">
        <MapViewer
          selectedDroneToView={selectedDrone}
          allDronesData={allDronesData}
          reDronesCount={redDroneCount}
        />

        <div className="absolute left-2 top-2 bottom-0 w-[400px] z-10">
          <DroneSelectorLayout
            title="DRONE FLYING"
            onClose={() => console.log("Close panel")}
          >
            {uniqueDrones.map((drone) => (
              <DroneCard
                key={drone?.features[0]?.properties?.registration}
                model={drone?.features[0]?.properties?.Name}
                serial={drone.features[0].properties.serial}
                registration={drone?.features[0]?.properties?.registration}
                pilot={drone?.features[0]?.properties?.pilot}
                organization={drone?.features[0]?.properties?.organization}
                status="active"
                isActive={
                  selectedDrone?.features[0].properties.serial ===
                  drone.features[0].properties.serial
                }
                onClick={() => setSelectedDrone(drone)}
              />
            ))}
            {uniqueDrones.length === 0 && (
              <div className="p-4 text-offWhite">
                {isConnected
                  ? "Connected - Waiting for drone data..."
                  : "Connecting to server..."}
              </div>
            )}
          </DroneSelectorLayout>
        </div>
      </div>
    </AppLayout>
  );
}

export default Home;
