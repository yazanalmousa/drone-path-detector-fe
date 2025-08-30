import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import DronePopupContent from "@/components/dronePopUp";

function useDroneClickEffect(
  onMap: mapboxgl.Map | null,
  droneObjects: any[],
  isAllowedToFlyFn: (registration: string) => boolean
) {
  const [popup] = useState(
    () =>
      new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: "drone-popup",
      })
  );

  useEffect(() => {
    if (!onMap || droneObjects.length === 0) {
      return;
    }

    const map = onMap;

    function showDronePopup(event: any) {
      const features = map.queryRenderedFeatures(event.point);

      // Find a drone feature (check all drone layers) - Fixed typing issue
      const droneFeature = features.find((feature) =>
        feature.layer?.id?.startsWith("object-layer-")
      );

      if (!droneFeature) {
        return;
      }

      // Change cursor style
      map.getCanvas().style.cursor = "pointer";

      const coordinates = event.lngLat;
      const properties = droneFeature.properties;

      if (!properties) return;

      // Create popup content - Fixed ReactDOM.render issue
      const element = document.createElement("div");
      const root = createRoot(element);

      root.render(
        <DronePopupContent
          name={properties.name || "Unknown Drone"}
          serial={properties.serial || "N/A"}
          registration={properties.registration || "N/A"}
          altitude={properties.altitude || 0}
          pilot={properties.pilot || "Unknown"}
          organization={properties.organization || "Unknown"}
          yaw={properties.yaw || 0}
          isAllowedToFly={isAllowedToFlyFn(properties.registration || "")}
        />
      );

      // Wait for rendering to complete then show popup
      setTimeout(() => {
        popup.setLngLat(coordinates).setHTML(element.outerHTML).addTo(map);
      }, 0);
    }

    function hidePopup() {
      map.getCanvas().style.cursor = "";
      popup.remove();
    }

    // Add click event to map
    map.on("click", showDronePopup);

    // Add hover effects
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    // Add hover events for all drone layers
    droneObjects.forEach((drone) => {
      const layerId = `object-layer-${drone.id}`;
      if (map.getLayer(layerId)) {
        map.on("mouseenter", layerId, handleMouseEnter);
        map.on("mouseleave", layerId, handleMouseLeave);
      }
    });

    return () => {
      map.off("click", showDronePopup);

      // Remove hover events
      droneObjects.forEach((drone) => {
        const layerId = `object-layer-${drone.id}`;
        if (map.getLayer(layerId)) {
          map.off("mouseenter", layerId, handleMouseEnter);
          map.off("mouseleave", layerId, handleMouseLeave);
        }
      });

      hidePopup();
    };
  }, [onMap, droneObjects, popup, isAllowedToFlyFn]);

  return popup;
}

export default useDroneClickEffect;
