// types/drone.ts

export interface DroneDataType {
  type: string;
  features: Features[];
}

export type Features = {
  type: string;
  properties: Properties;
  geometry: Geometry;
};

export type Properties = {
  serial: string;
  registration: string;
  Name: string;
  altitude: number;
  pilot: string;
  organization: string;
  yaw: number;
};

export type Geometry = {
  coordinates: number[];
  type: string;
};

export interface ProcessedDrone {
  id: string;
  registration: string;
  name: string;
  altitude: number;
  pilot: string;
  organization: string;
  yaw: number;
  coordinates: number[];
  isAllowed: boolean;
  timestamp: number;
}