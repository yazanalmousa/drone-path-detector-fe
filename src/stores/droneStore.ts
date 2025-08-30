import { create } from "zustand";
import type { DroneDataType } from "@/types/dronesData";
import { isAllowedToFly } from "@/utils/getDroneStatus";

interface DroneStore {
  allDronesData: DroneDataType[];
  selectedDrone: DroneDataType | null;
  redDroneCount: number;
  uniqueDronesMap: Map<string, DroneDataType>;

  addDroneData: (data: DroneDataType) => void;
  setSelectedDrone: (drone: DroneDataType | null) => void;
  getUniqueDrones: () => DroneDataType[];
  clearDrones: () => void;
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  allDronesData: [],
  selectedDrone: null,
  redDroneCount: 0,
  uniqueDronesMap: new Map(),

  addDroneData: (data) => {
    set((state) => {
      const registration = data.features[0]?.properties?.registration;
      const registrationsSeen = new Set(
        state.allDronesData.map((d) => d.features[0]?.properties?.registration)
      );

      let newRedCount = state.redDroneCount;
      if (
        !registrationsSeen.has(registration) &&
        !isAllowedToFly(registration)
      ) {
        newRedCount++;
      }

      const newUniqueMap = new Map(state.uniqueDronesMap);
      newUniqueMap.set(registration, data);

      return {
        allDronesData: [...state.allDronesData, data],
        redDroneCount: newRedCount,
        uniqueDronesMap: newUniqueMap,
      };
    });
  },

  setSelectedDrone: (drone) => set({ selectedDrone: drone }),

  getUniqueDrones: () => Array.from(get().uniqueDronesMap.values()),

  clearDrones: () =>
    set({
      allDronesData: [],
      selectedDrone: null,
      redDroneCount: 0,
      uniqueDronesMap: new Map(),
    }),
}));
