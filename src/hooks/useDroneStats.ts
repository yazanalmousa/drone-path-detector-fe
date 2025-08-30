// hooks/useDroneStats.ts
import { useMemo } from "react";
import { useDroneStore } from "@/stores/droneStore";
import { isAllowedToFly } from "@/utils/getDroneStatus";
import type { ProcessedDrone } from "@/types/dronesData";

interface DroneStats {
  totalDrones: number;
  activeDrones: number;
  restrictedDrones: number;
  uniqueOrganizations: number;
  uniquePilots: number;
  averageAltitude: number;
  highestAltitude: number;
  lowestAltitude: number;
  totalDataPoints: number;
  dronesArray: ProcessedDrone[];
  organizationBreakdown: { [org: string]: number };
  pilotBreakdown: { [pilot: string]: number };
}

export const useDroneStats = (): DroneStats => {
  const { uniqueDronesMap, redDroneCount, allDronesData } = useDroneStore();

  return useMemo(() => {
    const uniqueDrones = Array.from(uniqueDronesMap.values());

    if (uniqueDrones.length === 0) {
      return {
        totalDrones: 0,
        activeDrones: 0,
        restrictedDrones: 0,
        uniqueOrganizations: 0,
        uniquePilots: 0,
        averageAltitude: 0,
        highestAltitude: 0,
        lowestAltitude: 0,
        totalDataPoints: allDronesData.length,
        dronesArray: [],
        organizationBreakdown: {},
        pilotBreakdown: {},
      };
    }

    // Process unique drones data
    const dronesArray: ProcessedDrone[] = uniqueDrones.map((droneData) => {
      const feature = droneData.features[0];
      const registration = feature.properties.registration;

      return {
        id: registration,
        registration,
        name: feature.properties.Name || "Unknown",
        altitude: feature.properties.altitude || 0,
        pilot: feature.properties.pilot || "Unknown",
        organization: feature.properties.organization || "Unknown",
        yaw: feature.properties.yaw || 0,
        coordinates: feature.geometry.coordinates,
        isAllowed: isAllowedToFly(registration),
        timestamp: Date.now(),
      };
    });

    const activeDrones = dronesArray.filter((d) => d.isAllowed).length;
    const restrictedDrones = redDroneCount;

    const organizationBreakdown = dronesArray.reduce((acc, drone) => {
      acc[drone.organization] = (acc[drone.organization] || 0) + 1;
      return acc;
    }, {} as { [org: string]: number });

    const pilotBreakdown = dronesArray.reduce((acc, drone) => {
      acc[drone.pilot] = (acc[drone.pilot] || 0) + 1;
      return acc;
    }, {} as { [pilot: string]: number });

    const uniqueOrganizations = Object.keys(organizationBreakdown).length;
    const uniquePilots = Object.keys(pilotBreakdown).length;

    const altitudes = dronesArray
      .map((d) => d.altitude)
      .filter((alt) => alt > 0);
    const averageAltitude =
      altitudes.length > 0
        ? Math.round(
            altitudes.reduce((sum, alt) => sum + alt, 0) / altitudes.length
          )
        : 0;
    const highestAltitude = altitudes.length > 0 ? Math.max(...altitudes) : 0;
    const lowestAltitude = altitudes.length > 0 ? Math.min(...altitudes) : 0;

    return {
      totalDrones: dronesArray.length,
      activeDrones,
      restrictedDrones,
      uniqueOrganizations,
      uniquePilots,
      averageAltitude,
      highestAltitude,
      lowestAltitude,
      totalDataPoints: allDronesData.length,
      dronesArray,
      organizationBreakdown,
      pilotBreakdown,
    };
  }, [uniqueDronesMap, redDroneCount, allDronesData]);
};
