import React, { useState } from "react";
import { useGeolocated } from "react-geolocated";
import MapReportCard from "../AdminComponents/MapReportCard";
import SelectedReportModal from "../AdminComponents/SelectedReportModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEye, faCircle } from "@fortawesome/free-solid-svg-icons";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/types/database";

/*
  Public map preview section.
  - Uses user's geolocation when available, falls back to a reasonable default.
  - Reuses admin MapReportCard and SelectedReportModal to show markers and details.
  Assumption: default center is Manila ([120.9842, 14.5995]) — change if you'd like a different default.
*/
const MapPreviewSection: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<{
    report: PreverifiedReport | null;
    verificationStatus: PostverifiedReport | null;
  }>({ report: null, verificationStatus: null });
  const [showSelectedModal, setShowSelectedModal] = useState<boolean>(false);
  const [showUnvalidated, setShowUnvalidated] = useState<boolean>(false);

  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 10000,
  });

  const handleMarkerClick = (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => {
    setSelectedReport({
      report: data.report,
      verificationStatus: data.verificationStatus,
    });
    setShowSelectedModal(true);
  };

  const handleMarkerExit = () => {
    setSelectedReport({ report: null, verificationStatus: null });
    setShowSelectedModal(false);
  };

  // fallback center (longitude, latitude). Change as needed.
  const fallbackCenter: [number, number] = [120.9842, 14.5995];
  const userLocation: [number, number] = coords
    ? [coords.longitude, coords.latitude]
    : fallbackCenter;

  return (
    <section id="mapPreview">
      <div className="row d-flex flex-row justify-content-center align-items-end pb-2">
        <div className="col-12 text-center mb-3">
          <h2 className="font-weight-bold" style={{ fontSize: "3rem" }}>
            Explore the <span style={{ color: "#c2410c" }}>map</span>
          </h2>
          <p className="text-muted text-sm mt-2">
            Public reports are visible on the map below. Click a marker to view
            details.
          </p>
        </div>
      </div>

      <div className="row" style={{ height: "70vh" }}>
        <div className="col-md-8 px-3 d-flex flex-column justify-content-center">
          <div
            className="card shadow-lg"
            style={{
              height: "100%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div
              className="card-body p-0 d-flex flex-column"
              style={{ height: "100%" }}
            >
              {/* Map only card (tagline moved above) */}
              <div
                className="flex-grow-1 rounded overflow-hidden"
                style={{ minHeight: 0 }}
              >
                <MapReportCard
                  userLocation={userLocation}
                  onMarkerClick={handleMarkerClick}
                  showUnvalidated={showUnvalidated}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 px-3 d-flex flex-column justify-content-center">
          <div
            className="card shadow-lg"
            style={{
              height: "100%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div
              className="card-body p-4"
              style={{ overflowY: "scroll", height: "50vh" }}
            >
              <div className="mb-3">
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Report filter"
                  style={{ gap: "0.25rem" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowUnvalidated(false)}
                    aria-pressed={!showUnvalidated}
                    className="btn btn-sm"
                    style={
                      showUnvalidated
                        ? {
                            backgroundColor: "transparent",
                            color: "#ffffff",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "0.35rem",
                            padding: "0.35rem 0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }
                        : {
                            backgroundColor: "#c2410c",
                            borderColor: "#c2410c",
                            color: "#ffffff",
                            borderRadius: "0.35rem",
                            padding: "0.35rem 0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ color: "#ffffff" }}
                    />
                    <span>Validated</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUnvalidated(true)}
                    aria-pressed={showUnvalidated}
                    className="btn btn-sm"
                    style={
                      showUnvalidated
                        ? {
                            backgroundColor: "#c2410c",
                            borderColor: "#c2410c",
                            color: "#ffffff",
                            borderRadius: "0.35rem",
                            padding: "0.35rem 0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: "#ffffff",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "0.35rem",
                            padding: "0.35rem 0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }
                    }
                  >
                    <FontAwesomeIcon
                      icon={faEye}
                      style={{ color: "#ffffff" }}
                    />
                    <span>Show all</span>
                  </button>
                </div>
              </div>
              <h4 className="font-weight-bold" style={{ color: "#c2410c" }}>
                How it works
              </h4>
              <p className="text-white text-sm">
                This interactive map shows public reports collected from app
                users. Use the controls and filter to explore recent and
                validated reports around any area.
              </p>

              <ul
                className="text-white text-sm"
                style={{ paddingLeft: "1rem" }}
              >
                <li>
                  <strong style={{ color: "#c2410c" }}>Legend:</strong>{" "}
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{ color: "#2F855A", marginRight: 8 }}
                  />
                  validated,
                  <FontAwesomeIcon
                    icon={faCircle}
                    style={{ color: "#C53030", marginLeft: 12, marginRight: 8 }}
                  />
                  unvalidated
                </li>
                <li>
                  <strong style={{ color: "#c2410c" }}>Filter:</strong> switch
                  between <em>Validated only</em> and <em>All reports</em> to
                  control which markers are shown.
                </li>
                <li>
                  <strong style={{ color: "#c2410c" }}>Click a marker</strong>{" "}
                  to open details: media, timestamp, and verification status.
                </li>
                <li>
                  <strong style={{ color: "#c2410c" }}>Pan & zoom</strong> the
                  map to explore other neighborhoods. Use your browser/device
                  location if prompted to center near you.
                </li>
              </ul>

              <hr style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              <h5 className="text-white">Modal Tip</h5>
              <p className="text-muted text-sm">
                Click any marker to open the report modal (same viewer used in
                the admin area). The modal shows reporter details, a media
                preview (image or video), timestamps, and validation/post-
                validation information. Use the orange "Exit" button to close
                the modal. If media is loading you may briefly see a spinner.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="row d-flex flex-row justify-content-center align-items-center"
        style={{ height: "10vh" }}
      ></div>

      {/* Modal backdrop + modal (reuses existing selected modal) */}
      {showSelectedModal && (
        <div
          className="modal-backdrop fade show"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1040,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        ></div>
      )}

      <SelectedReportModal
        selectedReport={selectedReport}
        handleMarkerExit={handleMarkerExit}
        showSelectedModal={showSelectedModal}
      />
    </section>
  );
};

export default MapPreviewSection;
