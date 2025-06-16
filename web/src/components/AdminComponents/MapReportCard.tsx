import React, { useEffect, useRef } from "react";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/interfaces/interface";
import { ApolloMapHandler } from "../../constants/ApolloMapHandler";
import "ol/ol.css";

interface MapReportCardProps {
  userLocation: [number, number];
  verifiedReports: PostverifiedReport[];
  preverifiedReports: PreverifiedReport[];
  onMarkerClick: (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => void;
  showUnvalidated: boolean;
}

const MapReportCard: React.FC<MapReportCardProps> = ({
  userLocation,
  verifiedReports,
  preverifiedReports,
  onMarkerClick,
  showUnvalidated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapHandlerRef = useRef<ApolloMapHandler | null>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      mapHandlerRef.current = new ApolloMapHandler(
        mapContainerRef.current.id,
        userLocation,
        onMarkerClick,
        showUnvalidated
      );
      mapHandlerRef.current.updateAllReportsToday(
        verifiedReports,
        preverifiedReports
      );
    }

    if (mapHandlerRef.current) {
      mapHandlerRef.current.updateAllReportsToday(
        verifiedReports,
        preverifiedReports
      );
    }

    return () => {
      if (mapHandlerRef.current) {
        mapHandlerRef.current.clearOverlays();
        const mapInstance = (mapHandlerRef.current as any).map;
        if (mapInstance) {
          mapInstance.setTarget(undefined);
        }
      }
    };
  }, [showUnvalidated]);

  return (
    <div
      className="card card-primary w-100"
      style={{
        height: "95%",
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
