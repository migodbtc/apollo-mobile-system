import React, { useState } from "react";
import MapReportCard from "./MapReportCard";
import { useGeolocated } from "react-geolocated";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import ReportCard from "./ReportCard";
import SelectedReportModal from "./SelectedReportModal";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/types/database";

interface MapVisualPageProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

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

  const { preverifiedReports, postverifiedReports, combinedReports } =
    useAdminSQL();

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

  const dailyCombinedReports = combinedReports.filter(([report]) => {
    if (!report) return false;

    const reportDateObj = new Date(report.PR_timestamp);
    const today = new Date();

    const comparisonDate =
      reportDateObj.getUTCFullYear() === today.getUTCFullYear() &&
      reportDateObj.getUTCMonth() === today.getUTCMonth() &&
      reportDateObj.getUTCDate() === today.getUTCDate();

    // console.log(
    //   "Daily combined reports report #" +
    //     report.PR_report_id +
    //     ": " +
    //     comparisonDate
    // );
    // console.log(
    //   "└── Report Date: " +
    //     reportDateObj.getUTCDate() +
    //     " of " +
    //     reportDateObj.getUTCMonth() +
    //     ", " +
    //     reportDateObj.getUTCFullYear()
    // );
    // console.log(
    //   "└── Current Date: " +
    //     today.getUTCDate() +
    //     " of " +
    //     today.getUTCMonth() +
    //     ", " +
    //     today.getUTCFullYear()
    // );

    return comparisonDate;
  });

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
              {dailyCombinedReports.map(
                (
                  value: [PreverifiedReport, PostverifiedReport | null],
                  _: number
                ) => {
                  const [pr, vr] = value;

                  if (!showUnvalidated && vr == null) {
                    return;
                  }

                  console.log(value);

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
                verifiedReports={postverifiedReports}
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
