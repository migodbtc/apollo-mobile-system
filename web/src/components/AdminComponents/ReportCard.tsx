import {
  faBellSlash,
  faCheck,
  faHourglass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/types/database";

interface ReportCardProps {
  pr: PreverifiedReport;
  vr: PostverifiedReport | null;
  handleCardClick: (data: {
    report: PreverifiedReport;
    verificationStatus: PostverifiedReport | null;
  }) => void;
}

const ReportCard = ({ pr, vr, handleCardClick }: ReportCardProps) => {
  const generateVisualBadge = (level: string | undefined) => {
    if (level == undefined) {
      return (
        <div className="badge badge-muted">
          <span className="badge-text">Undefined</span>
        </div>
      );
    }

    const normalizedLevel = level.toLowerCase();

    if (["small", "mild", "low"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-secondary">
          <span className="badge-text">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }

    if (["moderate", "medium"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-warning">
          <span className="badge-text">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }

    if (["large", "severe", "high"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-danger">
          <span className="badge-text">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }
  };

  return (
    <div
      className="card text-black mt-1 mb-3"
      style={{
        borderRadius: "1rem",
        backgroundColor: "#11162B",
        height: "25vh",
        overflow: "hidden",
        userSelect: "none",
        cursor: "pointer",
      }}
      onClick={() => {
        const data = {
          report: pr,
          verificationStatus: vr,
        };
        handleCardClick(data);
      }}
    >
      <div className="row m-0" style={{ height: "100%" }}>
        <div className="col-md-7 p-3 d-flex flex-column align-items-left justify-content-center">
          <span className="text-xs text-muted">
            Report No {pr.PR_report_id}
          </span>
          <span className="text-sm text-bold" style={{ color: "#c2410c" }}>
            {pr.PR_address}
          </span>
          {vr == null ? (
            <span className="badge badge-danger w-50 mt-2">Unvalidated</span>
          ) : (
            <span className="badge badge-success w-50 mt-2">Validated</span>
          )}
          <span className="text-xs text-muted mt-2">{pr.PR_timestamp}</span>
        </div>
        <div className="col-md-5 p-3 d-flex flex-column justify-content-center align-items-center text-center">
          {vr == null && (
            <>
              <FontAwesomeIcon icon={faHourglass} className="text-muted" />
              <span className="text-xs text-muted text-center mt-2">
                Waiting for validation...
              </span>
            </>
          )}{" "}
          {vr && pr.PR_report_status != "false_alarm" && (
            <>
              <FontAwesomeIcon icon={faCheck} className="text-success" />
              <span className="text-xs text-muted my-2">Validated!</span>
              <span className="text-xs">
                Severity: {generateVisualBadge(vr.VR_severity_level)}
              </span>
              <span className="text-xs">
                Spread: {generateVisualBadge(vr.VR_spread_potential)}
              </span>
              <span className="text-xs">
                Type: {generateVisualBadge(vr.VR_fire_type)}
              </span>
            </>
          )}
          {vr && pr.PR_report_status == "false_alarm" && (
            <>
              <FontAwesomeIcon icon={faBellSlash} className="text-warning" />
              <span className="text-xs text-muted my-2">Validated!</span>
              <span
                className="text-xs text-muted"
                style={{ fontStyle: "italic" }}
              >
                The report has been validated as a "false alarm" report.{" "}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
