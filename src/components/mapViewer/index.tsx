import React, { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DroneDataType, Features } from "@/types/dronesData";
import DroneStatus from "@/components/dronePopUp";
import { createRoot } from "react-dom/client";
import { isAllowedToFly } from "@/utils/getDroneStatus";

type LngLat = [number, number];

interface MovingObject {
  id: string;
  name: string;
  coordinates: LngLat;
  serial: string;
  registration: string;
  altitude: number;
  pilot: string;
  organization: string;
  yaw: number;
  path: LngLat[];
  color: string;
  lastUpdate?: number;
}

interface Props {
  selectedDroneToView: DroneDataType | null;
  allDronesData: DroneDataType[];
  onMapSelectDrone?: (registration: string) => void;
  reDronesCount?: number;
}

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "YOUR_MAPBOX_ACCESS_TOKEN";
mapboxgl.accessToken = MAPBOX_TOKEN;

const PATH_LENGTH = 50;
const MIN_MOVE_METERS = 1.5;
const HEADING_METERS = 100;

const toRad = (d: number) => (d * Math.PI) / 180;

function movedEnough(a: LngLat, b: LngLat): boolean {
  const x = toRad(b[0] - a[0]) * Math.cos(toRad((a[1] + b[1]) / 2));
  const y = toRad(b[1] - a[1]);
  const meters = Math.sqrt(x * x + y * y) * 6371000;
  return meters >= MIN_MOVE_METERS;
}

function coordKey([lng, lat]: LngLat): string {
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
}

function projectYaw(
  [lng, lat]: LngLat,
  yawDeg: number,
  meters: number
): LngLat {
  const phi = toRad(lat);
  const north = Math.cos(toRad(yawDeg)) * meters;
  const east = Math.sin(toRad(yawDeg)) * meters;
  const dLat = north / 111320;
  const dLng = east / (111320 * Math.cos(phi));
  return [lng + dLng, lat + dLat];
}

const MapViewer: React.FC<Props> = ({
  selectedDroneToView,
  allDronesData,
  onMapSelectDrone,
  reDronesCount,
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const isReady = useRef(false);
  const dronesRef = useRef<Map<string, MovingObject>>(new Map());
  const seenRef = useRef<Map<string, Set<string>>>(new Map());
  const processedCountRef = useRef(0);
  const [redCount, setRedCount] = useState(0);

  const getDroneColor = (registration: string) =>
    isAllowedToFly(registration) ? "#24FF00" : "#FF000F";

  const processNewCollections = useCallback((collections: DroneDataType[]) => {
    const store = new Map(dronesRef.current);
    const seen = new Map(seenRef.current);

    collections.forEach((fc) => {
      fc.features.forEach((feature: Features) => {
        const registration = feature.properties.registration as string;
        if (!registration) return;

        const next: LngLat = [
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1],
        ];

        let drone = store.get(registration);

        if (!drone) {
          drone = {
            id: registration,
            name: feature.properties.Name,
            coordinates: next,
            serial: feature.properties.serial,
            registration,
            altitude: feature.properties.altitude,
            pilot: feature.properties.pilot,
            organization: feature.properties.organization,
            yaw: feature.properties.yaw,
            path: [next],
            color: getDroneColor(registration),
            lastUpdate: Date.now(),
          };
          store.set(registration, drone);

          let s = seen.get(registration);
          if (!s) {
            s = new Set<string>();
            seen.set(registration, s);
          }
          s.add(coordKey(next));
          return;
        }

        let s = seen.get(registration);
        if (!s) {
          s = new Set<string>();
          seen.set(registration, s);
        }

        const key = coordKey(next);
        if (s.has(key)) {
          drone.coordinates = next;
          drone.serial = feature.properties.serial;
          drone.altitude = feature.properties.altitude;
          drone.pilot = feature.properties.pilot;
          drone.organization = feature.properties.organization;
          drone.yaw = feature.properties.yaw;
          drone.color = getDroneColor(registration);
          drone.lastUpdate = Date.now();
          return;
        }

        const last = drone.path[drone.path.length - 1];
        if (!last || movedEnough(last, next)) {
          drone.path.push(next);
          s.add(key);

          if (drone.path.length > PATH_LENGTH) {
            const removed = drone.path.shift()!;
            s.delete(coordKey(removed));
          }
        }

        drone.coordinates = next;
        drone.serial = feature.properties.serial;
        drone.altitude = feature.properties.altitude;
        drone.pilot = feature.properties.pilot;
        drone.organization = feature.properties.organization;
        drone.yaw = feature.properties.yaw;
        drone.color = getDroneColor(registration);
        drone.lastUpdate = Date.now();
      });
    });

    dronesRef.current = store;
    seenRef.current = seen;
  }, []);

  const renderToMap = useCallback(() => {
    const m = mapRef.current;
    if (!m || !m.isStyleLoaded()) return;

    const drones = Array.from(dronesRef.current.values());
    setRedCount(drones.filter((d) => !isAllowedToFly(d.registration)).length);

    const droneFeatures = drones.map((d) => ({
      type: "Feature" as const,
      id: d.id,
      properties: {
        id: d.id,
        name: d.name,
        serial: d.serial,
        registration: d.registration,
        altitude: d.altitude,
        pilot: d.pilot,
        organization: d.organization,
        yaw: d.yaw,
        color: d.color,
      },
      geometry: {
        type: "Point" as const,
        coordinates: d.coordinates,
      },
    }));

    const pathFeatures = drones
      .filter((d) => d.path.length > 1)
      .map((d) => ({
        type: "Feature" as const,
        id: `path-${d.id}`,
        properties: { color: d.color },
        geometry: {
          type: "LineString" as const,
          coordinates: d.path.map((p) => [p[0], p[1]] as LngLat),
        },
      }));

    const headingFeatures = drones.map((d) => {
      const tip = projectYaw(d.coordinates, d.yaw || 0, HEADING_METERS);
      return {
        type: "Feature" as const,
        id: `head-${d.id}`,
        properties: { color: d.color },
        geometry: {
          type: "LineString" as const,
          coordinates: [d.coordinates, tip],
        },
      };
    });

    const dronesSrc = m.getSource("all-drones") as mapboxgl.GeoJSONSource;
    if (dronesSrc) {
      dronesSrc.setData({
        type: "FeatureCollection",
        features: droneFeatures,
      });
    }

    const pathsSrc = m.getSource("all-paths") as mapboxgl.GeoJSONSource;
    if (pathsSrc) {
      pathsSrc.setData({
        type: "FeatureCollection",
        features: pathFeatures,
      });
    }

    const headingSrc = m.getSource("yaw-headings") as mapboxgl.GeoJSONSource;
    if (headingSrc) {
      headingSrc.setData({
        type: "FeatureCollection",
        features: headingFeatures,
      });
    }
  }, []);

  useEffect(() => {
    if (isReady.current || !mapEl.current) return;

    processNewCollections(allDronesData);
    processedCountRef.current = allDronesData.length;

    const first = Array.from(dronesRef.current.values())[0];
    const initialCenter: LngLat = first?.coordinates ?? [35.9106, 31.9544];

    const m = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: 12,
      pitch: 0,
    });

    mapRef.current = m;
    isReady.current = true;

    m.on("load", () => {
      m.addSource("all-drones", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      m.addSource("all-paths", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        tolerance: 0,
        buffer: 128,
      });

      m.addSource("yaw-headings", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "all-drones",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#748AA1",
            10,
            "#000",
            50,
            "#FF000F",
          ],
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
          "circle-opacity": 0.99,
          "circle-blur": 0.3,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0B0B0B",
        },
      });

      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "all-drones",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      m.addLayer({
        id: "drones-layer",
        type: "circle",
        source: "all-drones",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 8,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });

      m.addLayer({
        id: "drone-labels",
        type: "symbol",
        source: "all-drones",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": 10,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      });

      m.addLayer({
        id: "paths-layer",
        type: "line",
        source: "all-paths",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 0.5,
        },
      });

      m.addLayer({
        id: "yaw-layer",
        type: "line",
        source: "yaw-headings",
        layout: {
          "line-cap": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 0,
        },
      });

      let hoverPopup: mapboxgl.Popup | null = null;

      m.on("mouseenter", "drones-layer", (e) => {
        m.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;

        const props = f.properties as any;
        const node = document.createElement("div");
        const root = createRoot(node);

        root.render(
          <DroneStatus
            model={props?.name}
            altitude={`${props?.altitude} m`}
            flightTime="00:25:45"
          />
        );

        hoverPopup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -10],
          className: "drone-popup",
        })
          .setLngLat((f.geometry as any).coordinates)
          .setDOMContent(node)
          .addTo(m);

        hoverPopup.on("close", () => root.unmount());
      });

      m.on("mousemove", "drones-layer", (e) => {
        const f = e.features?.[0];
        if (hoverPopup && f) {
          hoverPopup.setLngLat((f.geometry as any).coordinates);
        }
      });

      m.on("mouseleave", "drones-layer", () => {
        m.getCanvas().style.cursor = "";
        if (hoverPopup) {
          hoverPopup.remove();
          hoverPopup = null;
        }
      });

      m.on("click", "drones-layer", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const props = f.properties as any;
        const reg = String(props?.registration);
        const selected = dronesRef.current.get(reg);
        if (!selected) return;

        if (onMapSelectDrone) onMapSelectDrone(reg);

        m.flyTo({
          center: selected.coordinates,
          zoom: 15,
          duration: 1000,
        });

        if (m.getLayer("drones-layer")) {
          m.setPaintProperty("drones-layer", "circle-stroke-width", [
            "case",
            ["==", ["get", "registration"], reg],
            4,
            2,
          ]);
        }
      });

      renderToMap();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      isReady.current = false;
    };
  }, [processNewCollections, renderToMap, onMapSelectDrone]);

  useEffect(() => {
    if (!isReady.current) return;

    const prev = processedCountRef.current;
    if (allDronesData.length >= prev) {
      const nextSlice = allDronesData.slice(prev);
      processNewCollections(nextSlice);
      processedCountRef.current = allDronesData.length;
    } else {
      processNewCollections(allDronesData);
      processedCountRef.current = allDronesData.length;
    }

    renderToMap();
  }, [allDronesData, processNewCollections, renderToMap]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    const selectedRegistration =
      selectedDroneToView?.features?.[0]?.properties?.registration;

    if (!selectedRegistration) {
      if (m.getLayer("drones-layer")) {
        m.setPaintProperty("drones-layer", "circle-stroke-width", 2);
      }
      return;
    }

    const selected = dronesRef.current.get(String(selectedRegistration));
    if (!selected) return;

    m.flyTo({
      center: selected.coordinates,
      zoom: 15,
      duration: 1000,
    });

    if (m.getLayer("drones-layer")) {
      m.setPaintProperty("drones-layer", "circle-stroke-width", [
        "case",
        ["==", ["get", "registration"], String(selectedRegistration)],
        4,
        2,
      ]);
    }
  }, [selectedDroneToView]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapEl} style={{ width: "100%", height: "100%" }} />

      <div className="absolute right-3 bottom-3 bg-[#D9D9D9] px-3 py-2 rounded-md pointer-events-none flex items-center gap-2">
        <div className="rounded-full bg-[#1F2327] text-[#FFFFFF] font-[700] text-[16px] w-8 h-8 flex items-center justify-center">
          {reDronesCount}
        </div>
        <span className="text-[#3C4248] text-[14px] font-[400]">
          Drone Flying{" "}
        </span>
      </div>
    </div>
  );
};

export default MapViewer;
