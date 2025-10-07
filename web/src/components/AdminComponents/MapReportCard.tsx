import React, { useEffect, useRef } from "react";
import { ApolloMapHandler } from "../../constants/ApolloMapHandler";
import "ol/ol.css";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/types/database";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

interface MapReportCardProps {
  userLocation: [number, number];
  onMarkerClick: (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => void;
  showUnvalidated: boolean;
}

const MapReportCard: React.FC<MapReportCardProps> = ({
  userLocation,
  onMarkerClick,
  showUnvalidated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapHandlerRef = useRef<ApolloMapHandler | null>(null);
  const uniqueIdRef = useRef<string>(
    `map-${Math.random().toString(36).slice(2, 9)}`
  );

  const {
    preverifiedReports,
    postverifiedReports,
    fetchPostverifiedReports,
    fetchPreverifiedReports,
  } = useAdminSQL();

  // Initialize map once
  useEffect(() => {
    fetchPreverifiedReports();
    fetchPostverifiedReports();

    if (mapContainerRef.current && !mapHandlerRef.current) {
      // ensure the container has a unique id for ol to target
      if (!mapContainerRef.current.id) {
        mapContainerRef.current.id = uniqueIdRef.current;
      }
      mapHandlerRef.current = new ApolloMapHandler(
        mapContainerRef.current,
        userLocation,
        onMarkerClick,
        showUnvalidated
      );
    }

    return () => {
      if (mapHandlerRef.current) {
        mapHandlerRef.current.clearOverlays();
        const mapInstance = (mapHandlerRef.current as any).map;
        if (mapInstance) {
          mapInstance.setTarget(undefined);
        }
        mapHandlerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update overlays when reports or visibility toggle changes
  useEffect(() => {
    if (mapHandlerRef.current) {
      try {
        // update handler's internal flag first so subsequent load uses the right filter
        if (typeof mapHandlerRef.current.setShowUnvalidated === "function") {
          (mapHandlerRef.current as any).setShowUnvalidated(showUnvalidated);
        }

        mapHandlerRef.current.clearOverlays();
        mapHandlerRef.current.updateAllReportsToday(
          postverifiedReports,
          preverifiedReports
        );
      } catch (e) {
        console.error("Error updating map overlays:", e);
      }
    }
  }, [postverifiedReports, preverifiedReports, showUnvalidated]);

  return (
    <div
      className="card card-primary w-100"
      style={{
        height: "100%",
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      <div
        id="map"
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
      ></div>
    </div>
  );
};

export default MapReportCard;
