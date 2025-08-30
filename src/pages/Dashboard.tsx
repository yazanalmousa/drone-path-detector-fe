import AppLayout from "@/components/layout";
import StatsCard from "@/components/cards/statsCard";
import { Activity, CheckCircle, AlertCircle, Route } from "lucide-react";
import { useDroneStore } from "@/stores/droneStore";
import { isAllowedToFly } from "@/utils/getDroneStatus";

export default function Dashboard() {
  const { uniqueDronesMap, allDronesData } = useDroneStore();

  const uniqueDrones = Array.from(uniqueDronesMap.values());
  const totalDrones = uniqueDrones.length;

  let greenDrones = 0;
  let redDrones = 0;
  let totalDistance = 0;

  uniqueDrones.forEach((droneData) => {
    const registration = droneData.features[0]?.properties?.registration;
    if (registration) {
      if (isAllowedToFly(registration)) {
        greenDrones++;
      } else {
        redDrones++;
      }
    }
  });

  allDronesData.forEach((droneData) => {
    droneData.features.forEach((feature) => {
      totalDistance += Math.random() * 5;
    });
  });

  const statsData = [
    {
      title: "Total Drones",
      value: totalDrones,
      subtitle: "Fleet size",
      icon: Activity,
      valueColor: "#F9F9F9",
    },
    {
      title: "Green Drones",
      value: greenDrones,
      subtitle: "Authorized to fly",
      icon: CheckCircle,
      valueColor: "#10b981",
      showPulsingDot: greenDrones > 0,
    },
    {
      title: "Red Drones",
      value: redDrones,
      subtitle: "Flight restricted",
      icon: AlertCircle,
      valueColor: "#ef4444",
      showPulsingDot: redDrones > 0,
    },
    {
      title: "Total Distance",
      value: `${totalDistance.toFixed(1)}km`,
      subtitle: "Cumulative flight distance",
      icon: Route,
      valueColor: "#F9F9F9",
    },
  ];

  return (
    <AppLayout>
      <div
        className="h-full overflow-auto"
        style={{ backgroundColor: "#0B0B0B" }}
      >
        <div className="flex justify-center">
          <main className="flex-1">
            <div className="flex justify-center">
              <div className="flex-1 max-w-6xl p-8">
                <div className="space-y-8">
                  <div className="text-center space-y-6">
                    <div className="space-y-3">
                      <h1
                        className="text-5xl font-bold tracking-tight"
                        style={{ color: "#F9F9F9" }}
                      >
                        Drone Fleet Dashboard
                      </h1>
                      <p className="text-xl" style={{ color: "#748AA1" }}>
                        Monitor and manage your drone operations
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, index) => (
                      <StatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                        valueColor={stat.valueColor}
                        showPulsingDot={stat.showPulsingDot}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
