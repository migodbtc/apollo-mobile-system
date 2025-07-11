import {
  faBan,
  faBellSlash,
  faCamera,
  faCheckCircle,
  faFileAlt,
  faHourglass,
  faQuestion,
  faThumbsUp,
  faTimes,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/types/database";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import { useEffect, useState } from "react";

const renderReportStatusBadge = (role: string | undefined) => {
  let badgeStyle: { backgroundColor: string; color: string } = {
    backgroundColor: "",
    color: "",
  };
  let badgeText = "";
  let badgeIcon;

  switch (role) {
    case "pending":
      badgeStyle = {
        backgroundColor: "#F59E0B", // BG-WARNING
        color: "#000000",
      };
      badgeText = "Pending";
      badgeIcon = faHourglass;
      break;
    case "verified":
      badgeStyle = {
        backgroundColor: "#3B82F6", // BG-PRIMARY
        color: "#FFFFFF",
      };
      badgeText = "Validated";
      badgeIcon = faThumbsUp;
      break;
    case "false_alarm":
      badgeStyle = {
        backgroundColor: "#EF4444", // BG-DANGER
        color: "#FFFFFF",
      };
      badgeText = "False Alarm";
      badgeIcon = faBellSlash;
      break;
    case "resolved":
      badgeStyle = {
        backgroundColor: "#22C55E", // BG-GREEN
        color: "#FFFFFF",
      };
      badgeText = "Resolved";
      badgeIcon = faCheckCircle;
      break;
    default:
      badgeStyle = {
        backgroundColor: "#111827", // GRAY
        color: "#FFFFFF",
      };
      badgeText = "Unknown status";
      badgeIcon = faQuestion;
      break;
  }

  return (
    <span
      style={{
        backgroundColor: badgeStyle.backgroundColor,
        borderRadius: "1rem",
        color: badgeStyle.color,
      }}
      className="badge badge-xs text-bold px-2 py-1"
    >
      <FontAwesomeIcon icon={badgeIcon} className="mr-2" />
      {badgeText}
    </span>
  );
};

const renderRoleBadge = (role: string | undefined) => {
  let badgeStyle: { backgroundColor: string; color: string } = {
    backgroundColor: "",
    color: "",
  };
  let badgeText = "";

  switch (role) {
    case "guest":
      badgeStyle = {
        backgroundColor: "#111827", // GRAY
        color: "#FFFFFF",
      };
      badgeText = "Guest";
      break;
    case "civilian":
      badgeStyle = {
        backgroundColor: "#3B82F6", // BLUE
        color: "#FFFFFF",
      };
      badgeText = "Civilian";
      break;
    case "responder":
      badgeStyle = {
        backgroundColor: "#F59E0B", // AMBER
        color: "#FFFFFF",
      };
      badgeText = "Responder";
      break;
    case "admin":
      badgeStyle = {
        backgroundColor: "#EF4444", // RED
        color: "#FFFFFF",
      };
      badgeText = "Administrator";
      break;
    case "superadmin":
      badgeStyle = {
        backgroundColor: "#01B073", // TEAL
        color: "#FFFFFF",
      };
      badgeText = "Superadministrator";
      break;
    default:
      badgeStyle = {
        backgroundColor: "#6B7280", // CYAN
        color: "#FFFFFF",
      };
      badgeText = "Unknown Role";
      break;
  }

  return (
    <span
      style={{
        backgroundColor: badgeStyle.backgroundColor,
        borderRadius: "1rem",
        color: badgeStyle.color,
      }}
      className="badge badge-xs text-bold px-2 py-1"
    >
      {badgeText}
    </span>
  );
};

const renderMediaTypeBadge = (mediaType?: string) => {
  let badgeStyle: { backgroundColor: string; color: string } = {
    backgroundColor: "#6B7280", // Default gray
    color: "#fff",
  };
  let badgeText = "Unknown";
  let badgeIcon = faQuestion;

  if (mediaType?.startsWith("image/")) {
    badgeStyle = {
      backgroundColor: "#22C55E", // emerald green
      color: "#fff",
    };
    badgeText = "Image";
    badgeIcon = faCamera;
  } else if (mediaType?.startsWith("video/")) {
    badgeStyle = {
      backgroundColor: "#7C3AED", // purple
      color: "#fff",
    };
    badgeText = "Video";
    badgeIcon = faVideo;
  }

  return (
    <span
      style={{
        backgroundColor: badgeStyle.backgroundColor,
        borderRadius: "1rem",
        color: badgeStyle.color,
      }}
      className="badge badge-xs text-bold px-2 py-1"
    >
      <FontAwesomeIcon icon={badgeIcon} className="mr-2" />
      {badgeText}
    </span>
  );
};

interface SelectedReportModalProps {
  selectedReport: {
    report: PreverifiedReport | null;
    verificationStatus: PostverifiedReport | null;
  };
  showSelectedModal: boolean;
  handleMarkerExit: () => void;
}

const SelectedReportModal = ({
  selectedReport,
  showSelectedModal,
  handleMarkerExit,
}: SelectedReportModalProps) => {
  const { userAccounts, mediaStorage, fetchMediaBlobById, refreshAll } =
    useAdminSQL();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const associatedReporter = userAccounts.find(
    (account) => account.UA_user_id === selectedReport.report?.PR_user_id
  );

  const associatedMedia = mediaStorage.find(
    (media) =>
      media.MS_media_id === selectedReport.report?.PR_image ||
      media.MS_media_id === selectedReport.report?.PR_video
  );

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    let url: string | null = null;
    setMediaUrl(null);

    const fetchBlob = async () => {
      if (associatedMedia && associatedMedia.MS_media_id !== undefined) {
        const blob = await fetchMediaBlobById(associatedMedia.MS_media_id);
        console.log(`Blob status: ${blob ? "fetched" : "not found"}`);
        if (blob) {
          url = URL.createObjectURL(blob);
          setMediaUrl(url);
        }
      }
    };

    fetchBlob();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [associatedMedia, fetchMediaBlobById]);

  return (
    <div
      className={`modal fade ${
        showSelectedModal
          ? "show d-flex justify-content-center align-items-center"
          : "d-none"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
        width: "100%",
        height: "100%",
        overflow: "auto",
        overflowY: "hidden",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="modal-dialog modal-lg"
        style={{
          overflowY: "hidden",
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "rgb(17, 22, 43)",
            borderRadius: "1rem",
            height: "80vh",
          }}
        >
          <div className="modal-body p-5" style={{ overflowY: "scroll" }}>
            <h5
              className="box-title mt-1 text-bold"
              style={{ color: "rgb(194, 65, 12)" }}
            >
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              Report ID {selectedReport.report?.PR_report_id}
            </h5>
            <span className="text-muted text-sm text-bold mt-2">
              INFORMATION
            </span>
            <p className="text-sm">
              Information about the report can be found here. Prevalidated
              reports will show basic report submission details, while validated
              reports will show additional information. Validated reports can
              either be verified by human intervention or by machine analysis.
            </p>
            <div className="row w-100 align-items-stretch">
              <div className="col-md-8">
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    REPORT DATA
                  </span>
                </div>
                <div className="row">
                  <div className="col-md-6">Address</div>
                  <div className="col-md-6">
                    {selectedReport.report?.PR_address}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">Coordinates</div>
                  <div className="col-md-6 text-sm text-muted">
                    <span>
                      {"("}
                      {selectedReport.report?.PR_latitude}
                      {", "}
                      {selectedReport.report?.PR_longitude}
                      {")"}
                    </span>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Date & Time</div>
                  <div className="col-md-6 text-sm">
                    {selectedReport.report?.PR_timestamp
                      ? (() => {
                          // Example: "Fri, 27 Jun 2025 23:04:35 GMT"
                          const ts = selectedReport.report.PR_timestamp;
                          const parts = ts.split(" ");
                          // parts = ["Fri,", "27", "Jun", "2025", "23:04:35", "GMT"]
                          const datePart = `${parts[1]} ${parts[2]}, ${parts[3]}`;
                          const timePart = parts[4];
                          return (
                            <>
                              <div>{datePart}</div>
                              <div>{timePart}</div>
                            </>
                          );
                        })()
                      : ""}
                  </div>
                </div>
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    REPORTER DATA
                  </span>
                </div>
                {/* Report data should fetch details to server */}
                <div className="row">
                  <div className="col-md-6">Name</div>
                  <div className="col-md-6">
                    {associatedReporter === undefined ? (
                      <FontAwesomeIcon
                        icon={faHourglass}
                        size="sm"
                        className="mr-2"
                      />
                    ) : associatedReporter ? (
                      <>
                        {`${associatedReporter.UA_first_name || ""} ${
                          associatedReporter.UA_last_name || ""
                        }`.trim()}
                        {associatedReporter.UA_username && (
                          <span style={{ color: "rgb(249, 115, 22)" }}>
                            {" "}
                            (@{associatedReporter.UA_username})
                          </span>
                        )}
                      </>
                    ) : (
                      `(${selectedReport.report?.PR_user_id})`
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">Role</div>
                  <div className="col-md-6">
                    {associatedReporter === undefined ? (
                      <FontAwesomeIcon
                        icon={faHourglass}
                        size="sm"
                        className="mr-2"
                      />
                    ) : (
                      renderRoleBadge(associatedReporter?.UA_user_role)
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Reputation</div>
                  <div className="col-md-6">
                    {associatedReporter === undefined ? (
                      <FontAwesomeIcon
                        icon={faHourglass}
                        size="sm"
                        className="mr-2"
                      />
                    ) : (
                      associatedReporter?.UA_reputation_score || (
                        <FontAwesomeIcon icon={faBan} />
                      )
                    )}
                  </div>
                </div>
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    MEDIA DATA
                  </span>
                </div>
                {/* Media data should also be analyzed by the report using third party modules */}
                <div className="row">
                  <div className="col-md-6">Media</div>
                  <div className="col-md-6">
                    {associatedMedia ? (
                      renderMediaTypeBadge(associatedMedia.MS_file_type)
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">File Size</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    VALIDATION DATA
                  </span>
                </div>
                <div className="row">
                  <div className="col-md-6">Status</div>
                  <div className="col-md-6">
                    {renderReportStatusBadge(
                      selectedReport.report?.PR_report_status
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">Validated?</div>
                  <div className="col-md-6">
                    {selectedReport.verificationStatus != null ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              {/* MEDIA PREVIEW */}
              <div
                className="col-md-4 d-flex flex-column p-0"
                style={{ height: "" }}
              >
                <div
                  className="card bg-dark mb-0 flex-grow-1"
                  style={{
                    width: "100%",
                    aspectRatio: 9 / 16,
                    borderRadius: "1rem",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!associatedMedia ? (
                    <span className="text-muted">No media available</span>
                  ) : !mediaUrl ? (
                    <FontAwesomeIcon
                      icon={faHourglass}
                      spin
                      size="2x"
                      className="text-muted"
                    />
                  ) : associatedMedia.MS_file_type.startsWith("image/") ? (
                    <img
                      src={mediaUrl}
                      alt="Report Media"
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : associatedMedia.MS_file_type.startsWith("video/") ? (
                    <video
                      src={mediaUrl}
                      controls
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                  ) : (
                    <span className="text-muted">Unsupported media type</span>
                  )}
                </div>
              </div>
            </div>
            {/* POST VALIDATION */}
            <div>
              <div className="row w-100 mt-4 mx-0">
                <span className="text-muted text-sm text-bold">
                  POSTVALIDATION DETAILS
                </span>
              </div>
              <div className="row w-100 mt-1 mx-0">
                <p className="text-sm">
                  This segment is only visible if the selected report is
                  validated by the system or the responders. After the
                  intervention for validation, the report contains the following
                  data below.
                </p>
              </div>
            </div>
          </div>
          <div
            className="modal-footer justify-content-right"
            style={{ border: "none" }}
          >
            <button
              type="button"
              className="btn btn-primary px-4"
              style={{
                backgroundColor: "rgb(249, 115, 22)",
                border: "none",
                borderRadius: "1rem",
              }}
              onClick={handleMarkerExit}
            >
              <FontAwesomeIcon icon={faTimes} />
              {"  "}Exit Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedReportModal;
