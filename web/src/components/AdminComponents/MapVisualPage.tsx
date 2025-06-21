import React, { useState } from "react";
import MapReportCard from "./MapReportCard";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/interfaces/interface";
import { useGeolocated } from "react-geolocated";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import ReportCard from "./ReportCard";
import SelectedReportModal from "./SelectedReportModal";

interface MapVisualPageProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const verifiedReports: PostverifiedReport[] = [
  {
    VR_verification_id: 1,
    VR_report_id: 101,
    VR_confidence_score: 0.92,
    VR_detected: true,
    VR_verification_timestamp: "2025-06-21T09:45:00Z",
    VR_severity_level: "moderate",
    VR_spread_potential: "high",
    VR_fire_type: "medium",
  },
  {
    VR_verification_id: 2,
    VR_report_id: 102,
    VR_confidence_score: 0.87,
    VR_detected: true,
    VR_verification_timestamp: "2025-06-21T11:25:00Z",
    VR_severity_level: "mild",
    VR_spread_potential: "high",
    VR_fire_type: "large",
  },
  {
    VR_verification_id: 3,
    VR_report_id: 105,
    VR_confidence_score: 0.95,
    VR_detected: false,
    VR_verification_timestamp: "2025-06-21T14:25:00Z",
    VR_severity_level: undefined,
    VR_spread_potential: undefined,
    VR_fire_type: undefined,
  },
];

const preverifiedReports: PreverifiedReport[] = [
  {
    PR_report_id: 103,
    PR_user_id: 3,
    PR_image: 1001,
    PR_video: 1002,
    PR_latitude: 14.582,
    PR_longitude: 121.041,
    PR_address: "San Miguel Avenue, near Kai Garden Residences, Mandaluyong",
    PR_timestamp: "2025-06-21T10:15:00Z",
    PR_verified: false,
    PR_report_status: "pending",
  },
  {
    PR_report_id: 104,
    PR_user_id: 4,
    PR_image: 1003,
    PR_video: 1004,
    PR_latitude: 14.5805,
    PR_longitude: 121.0398,
    PR_address: "J.P. Rizal Street, Mandaluyong (near Kai Garden)",
    PR_timestamp: "2025-06-21T12:30:00Z",
    PR_verified: false,
    PR_report_status: "pending",
  },
  {
    PR_report_id: 101,
    PR_user_id: 1,
    PR_image: 123,
    PR_video: 456,
    PR_latitude: 14.5815,
    PR_longitude: 121.0405,
    PR_address: "Kai Garden Residences, Mandaluyong City",
    PR_timestamp: "2025-06-21T09:30:00Z",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 102,
    PR_user_id: 2,
    PR_image: 789,
    PR_video: 101112,
    PR_latitude: 14.5818,
    PR_longitude: 121.0412,
    PR_address: "Adjacent building to Kai Garden Residences",
    PR_timestamp: "2025-06-21T11:10:00Z",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 105,
    PR_user_id: 5,
    PR_image: 1005,
    PR_video: 1006,
    PR_latitude: 14.579,
    PR_longitude: 121.038,
    PR_address: "Boni Avenue, Mandaluyong",
    PR_timestamp: "2025-06-21T14:05:00Z",
    PR_verified: true,
    PR_report_status: "false_alarm",
  },
];

const combinedReports = preverifiedReports.map(
  (preverified: PreverifiedReport) => {
    const prDate = new Date(preverified.PR_timestamp)
      .toISOString()
      .slice(0, 10);

    const verified = verifiedReports.find((v) => {
      const vrDate = new Date(v.VR_verification_timestamp)
        .toISOString()
        .slice(0, 10);
      const idMatch = v.VR_report_id === preverified.PR_report_id;
      const dateMatch = vrDate === prDate;

      return idMatch && dateMatch;
    });

    return [preverified, verified ?? null] as [
      PreverifiedReport,
      PostverifiedReport | null
    ];
  }
);

const combinedReportsToday = combinedReports
  .filter(([preverified]) => {
    const reportDate = new Date(preverified.PR_timestamp)
      .toISOString()
      .slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return reportDate === today;
  })
  .map(([preverified, verified]) => {
    const verifiedToday = verified
      ? new Date(verified.VR_verification_timestamp)
          .toISOString()
          .slice(0, 10) === new Date().toISOString().slice(0, 10)
      : null;

    return [preverified, verifiedToday ? verified : null] as [
      PreverifiedReport,
      PostverifiedReport | null
    ];
  });

const MapVisualPage = ({}: MapVisualPageProps) => {
  const [selectedReport, setSelectedReport] = useState<{
    report: PreverifiedReport | null;
    verificationStatus: PostverifiedReport | null;
  }>({ report: null, verificationStatus: null });
  const [showUnvalidated, setShowUnvalidated] = useState<boolean>(false);
  const [showSelectedModal, setShowSelectedModal] = useState<boolean>(false);
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 10000,
  });

  const handleClickEvent = (data: {
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

  return (
    <>
      <div className="container-fluid" style={{ height: "90vh" }}>
        <div className="row h-100">
          <div className="d-flex flex-column col-md-5 h-100 pb-2">
            <div
              className="d-flex flex-row justify-content-between align-items-center"
              style={{ color: "#c2410c", height: "5%" }}
            >
              <div>
                <h5 className="box-title mt-1">Reports Visualization</h5>
              </div>
            </div>
            <div
              className="card p-4 text-black mt-1 mb-0"
              style={{
                borderRadius: "1rem",
                backgroundColor: "#11162B",
                height: "auto",
              }}
            >
              <span className="text-muted text-sm text-bold">INFORMATION</span>
              <p className="text-sm">
                Reports submitted into the system are denoted as markers with
                the map on the right. Clicking a marker will render information
                about the report.
              </p>
              <span className="text-sm text-muted">
                <FontAwesomeIcon
                  icon={showUnvalidated ? faSquareCheck : faSquare}
                  color="#c2410c"
                  onClick={() => {
                    setShowUnvalidated(!showUnvalidated);
                  }}
                  style={{ cursor: "pointer" }}
                />
                {"  "}View unvalidated reports?
              </span>
              {/* <span className="text-muted text-sm text-bold">MARKERS</span>
            <table className="table table-borderless text-sm mb-0">
              <tbody>
                <tr>
                  <td>
                    <span className="badge badge-danger">Red Marker</span>
                  </td>
                  <td>Signifies the location of an unvalidated report</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge badge-success">Green Marker</span>
                  </td>
                  <td>Signifies the location of a validated report.</td>
                </tr>
              </tbody>
            </table> */}
            </div>
            <div
              className="pt-3 my-3"
              style={{ height: "auto", overflowY: "scroll" }}
            >
              {combinedReportsToday.map(
                (
                  value: [PreverifiedReport, PostverifiedReport | null],
                  _: number
                ) => {
                  const [pr, vr] = value;

                  if (!showUnvalidated && vr == null) {
                    return;
                  }

                  return (
                    <ReportCard
                      vr={vr}
                      pr={pr}
                      handleCardClick={handleClickEvent}
                    />
                  );
                }
              )}
            </div>
          </div>
          <div className="col-md-7 h-100">
            {coords && (
              <MapReportCard
                userLocation={[coords?.longitude, coords?.latitude]}
                preverifiedReports={preverifiedReports}
                verifiedReports={verifiedReports}
                onMarkerClick={handleClickEvent}
                showUnvalidated={showUnvalidated}
              />
            )}
          </div>
        </div>
      </div>
      <div>
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
      </div>
    </>
  );
};

export default MapVisualPage;
