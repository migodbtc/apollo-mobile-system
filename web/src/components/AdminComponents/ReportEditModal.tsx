import { useState, useEffect } from "react";
import type {
  PostverifiedReport,
  CombinedReport,
  PreverifiedReport,
} from "../../constants/types/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faFloppyDisk,
  faRightFromBracket,
  faRotateLeft,
  faHourglass,
  faBan,
  faCamera,
  faVideo,
  faQuestion,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import type {
  ReportStatus,
  SeverityLevel,
  SpreadPotential,
} from "../../constants/types/types";
import axios from "axios";
import { SERVER_LINK } from "../../constants/netvar";

const REPORT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Validated" },
  { value: "false_alarm", label: "False Alarm" },
  { value: "resolved", label: "Resolved" },
];

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const SPREAD_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

const FIRE_TYPE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const renderRoleBadge = (role: string | undefined) => {
  let badgeStyle = { backgroundColor: "", color: "" };
  let badgeText = "";

  switch (role) {
    case "guest":
      badgeStyle = { backgroundColor: "#111827", color: "#FFFFFF" };
      badgeText = "Guest";
      break;
    case "civilian":
      badgeStyle = { backgroundColor: "#3B82F6", color: "#FFFFFF" };
      badgeText = "Civilian";
      break;
    case "responder":
      badgeStyle = { backgroundColor: "#F59E0B", color: "#FFFFFF" };
      badgeText = "Responder";
      break;
    case "admin":
      badgeStyle = { backgroundColor: "#EF4444", color: "#FFFFFF" };
      badgeText = "Administrator";
      break;
    case "superadmin":
      badgeStyle = { backgroundColor: "#01B073", color: "#FFFFFF" };
      badgeText = "Superadministrator";
      break;
    default:
      badgeStyle = { backgroundColor: "#6B7280", color: "#FFFFFF" };
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
  let badgeStyle = { backgroundColor: "#6B7280", color: "#fff" };
  let badgeText = "Unknown";
  let badgeIcon = faQuestion;

  if (mediaType?.startsWith("image/")) {
    badgeStyle = { backgroundColor: "#22C55E", color: "#fff" };
    badgeText = "Image";
    badgeIcon = faCamera;
  } else if (mediaType?.startsWith("video/")) {
    badgeStyle = { backgroundColor: "#7C3AED", color: "#fff" };
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

const generateVisualBadge = (level: string | undefined) => {
  if (level == undefined) {
    return (
      <div className="badge badge-muted">
        <span className="badge-text text-xs">None</span>
      </div>
    );
  }

  const normalizedLevel = level.toLowerCase();

  if (["small", "mild", "low"].includes(normalizedLevel)) {
    return (
      <div className="badge badge-secondary">
        <span className="badge-text text-xs px-2">
          {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
        </span>
      </div>
    );
  }

  if (["moderate", "medium"].includes(normalizedLevel)) {
    return (
      <div className="badge badge-warning">
        <span className="badge-text text-xs px-2">
          {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
        </span>
      </div>
    );
  }

  if (["large", "severe", "high"].includes(normalizedLevel)) {
    return (
      <div className="badge badge-danger">
        <span className="badge-text text-xs px-2">
          {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
        </span>
      </div>
    );
  }
};

function blankPostverifiedReport(reportId: number): PostverifiedReport {
  return {
    VR_verification_id: 0,
    VR_report_id: reportId,
    VR_confidence_score: 0,
    VR_detected: false,
    VR_verification_timestamp: "",
    VR_severity_level: undefined,
    VR_spread_potential: undefined,
    VR_fire_type: undefined,
  };
}

interface ReportEditModalProps {
  showSelectedModal: boolean;
  selectedRow: CombinedReport;
  setSelectedRow: React.Dispatch<React.SetStateAction<CombinedReport | null>>;
  handleExitClick: () => void;
}

const ReportEditModal = ({
  showSelectedModal,
  selectedRow,
  handleExitClick,
}: ReportEditModalProps) => {
  const [modifiedData, setModifiedData] = useState<CombinedReport | null>(
    selectedRow
  );
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const {
    userAccounts,
    mediaStorage,
    fetchMediaBlobById,
    fetchPreverifiedReports,
    fetchPostverifiedReports,
  } = useAdminSQL();

  const [manualPostverified, setManualPostverified] =
    useState<PostverifiedReport>(
      blankPostverifiedReport(selectedRow[0].PR_report_id)
    );

  const associatedReporter = userAccounts.find(
    (account) => account.UA_user_id === selectedRow[0].PR_user_id
  );

  const associatedMedia = mediaStorage.find(
    (media) =>
      media.MS_media_id === selectedRow[0].PR_image ||
      media.MS_media_id === selectedRow[0].PR_video
  );

  const handleReset = () => {
    setHasChanges(false);
    setMediaUrl(null);
    setManualPostverified(blankPostverifiedReport(selectedRow[0].PR_report_id));
    setModifiedData(selectedRow);
  };

  const handleInvalidation = async () => {
    if (!modifiedData || !modifiedData[1]) return;

    const confirmed = window.confirm(
      "Are you sure you want to invalidate this existing validation? This action cannot be undone."
    );
    if (!confirmed) return;

    const updatedPreverified: PreverifiedReport = {
      PR_report_id: modifiedData[0].PR_report_id,
      PR_user_id: modifiedData[0].PR_user_id,
      PR_image: modifiedData[0].PR_image,
      PR_video: modifiedData[0].PR_video,
      PR_latitude: modifiedData[0].PR_latitude,
      PR_longitude: modifiedData[0].PR_longitude,
      PR_address: modifiedData[0].PR_address,
      PR_timestamp: new Date(modifiedData[0].PR_timestamp)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
      PR_verified: false,
      PR_report_status: "pending" as ReportStatus,
    };

    const newPostverified: PostverifiedReport = {
      VR_verification_id: modifiedData[1].VR_verification_id,
      VR_report_id: modifiedData[0].PR_report_id,
      VR_confidence_score: modifiedData[1].VR_confidence_score,
      VR_detected: false,
      VR_verification_timestamp: new Date().toISOString(),
      VR_severity_level: undefined,
      VR_spread_potential: undefined,
      VR_fire_type: undefined,
    };

    const payload: [PreverifiedReport, PostverifiedReport] = [
      updatedPreverified,
      newPostverified,
    ];

    try {
      const response = await axios.post(
        `${SERVER_LINK}/reports/postverified/one/delete`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update report");
      }

      alert("Validation reset successfully!");
      fetchPreverifiedReports();
      fetchPostverifiedReports();
      handleExitClick();
    } catch (error) {
      console.error("Failed to invalidate post-verification:", error);
      alert("Failed to invalidate post-verification. Please try again.");
    }
  };

  const handleNewDataSubmission = async () => {
    if (!modifiedData) return;

    const confirmed = window.confirm(
      "Are you sure you want to submit these changes? This action will update the report and cannot be undone."
    );
    if (!confirmed) return;

    const isFalseAlarm = modifiedData[0].PR_report_status === "false_alarm";

    if (
      (modifiedData[0].PR_report_status === "verified" ||
        modifiedData[0].PR_report_status === "resolved") &&
      (manualPostverified.VR_severity_level === undefined ||
        manualPostverified.VR_spread_potential === undefined ||
        manualPostverified.VR_fire_type === undefined)
    ) {
      alert(
        "Please select Severity Level, Spread Potential, and Fire Type before saving."
      );
      return;
    }

    const updatedPreverified: PreverifiedReport = {
      PR_report_id: modifiedData[0].PR_report_id,
      PR_user_id: modifiedData[0].PR_user_id,
      PR_image: modifiedData[0].PR_image,
      PR_video: modifiedData[0].PR_video,
      PR_latitude: modifiedData[0].PR_latitude,
      PR_longitude: modifiedData[0].PR_longitude,
      PR_address: modifiedData[0].PR_address,
      PR_timestamp: selectedRow[0].PR_timestamp,
      PR_verified:
        modifiedData[0].PR_report_status === "verified" ||
        modifiedData[0].PR_report_status === "resolved" ||
        modifiedData[0].PR_report_status === "false_alarm"
          ? true
          : false,
      PR_report_status: modifiedData[0].PR_report_status,
    };

    const newPostverified: PostverifiedReport = {
      ...manualPostverified,
      VR_report_id: modifiedData[0].PR_report_id,
      VR_verification_timestamp: new Date().toISOString(),
      VR_detected: isFalseAlarm
        ? false
        : modifiedData[0].PR_report_status === "verified" ||
          modifiedData[0].PR_report_status === "resolved"
        ? true
        : manualPostverified.VR_detected,
      VR_severity_level: isFalseAlarm
        ? undefined
        : manualPostverified.VR_severity_level,
      VR_spread_potential: isFalseAlarm
        ? undefined
        : manualPostverified.VR_spread_potential,
      VR_fire_type: isFalseAlarm ? undefined : manualPostverified.VR_fire_type,
    };

    const payload: [PreverifiedReport, PostverifiedReport] = [
      updatedPreverified,
      newPostverified,
    ];

    console.log("Submission payload:", payload);

    try {
      const response = await axios.post(
        `${SERVER_LINK}/reports/preverified/one/verify`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update report");
      }

      alert("Report updated successfully!");
      fetchPreverifiedReports();
      fetchPostverifiedReports();
      handleExitClick();
    } catch (error) {
      console.error("Failed to update report:", error);
      alert("Failed to update report. Please try again.");
    }
  };

  const handleInvalidatePostverification = async () => {
    if (!modifiedData || !modifiedData[1]) return;
    handleInvalidation();
  };

  useEffect(() => {
    setModifiedData(selectedRow);
    setManualPostverified(blankPostverifiedReport(selectedRow[0].PR_report_id));
  }, [selectedRow]);

  useEffect(() => {
    if (!modifiedData) {
      setHasChanges(false);
      return;
    }
    const original = selectedRow[0];
    const modified = modifiedData[0];
    const changed =
      original.PR_report_status !== modified.PR_report_status ||
      original.PR_address !== modified.PR_address ||
      original.PR_latitude !== modified.PR_latitude ||
      original.PR_longitude !== modified.PR_longitude ||
      original.PR_verified !== modified.PR_verified;

    setHasChanges(changed);
  }, [modifiedData, selectedRow]);

  useEffect(() => {
    let url: string | null = null;
    setMediaUrl(null);

    const fetchBlob = async () => {
      if (
        associatedMedia &&
        associatedMedia.MS_media_id !== undefined &&
        fetchMediaBlobById
      ) {
        const blob = await fetchMediaBlobById(associatedMedia.MS_media_id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="modal-dialog modal-lg" style={{ overflowY: "hidden" }}>
        <div
          className="modal-content"
          style={{
            backgroundColor: "rgb(17, 22, 43)",
            borderRadius: "1rem",
            height: "80vh",
          }}
        >
          {modifiedData && (
            <div className="modal-body p-5" style={{ overflowY: "scroll" }}>
              <h5
                className="box-title mt-1 text-bold"
                style={{ color: "rgb(194, 65, 12)" }}
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                Report ID {modifiedData[0].PR_report_id}
              </h5>
              <span className="text-muted text-sm text-bold mt-2">
                INFORMATION
              </span>
              <p className="text-sm">
                Contains all the information about the report registered within
                the system. Depending on whether the report has been validated
                or not, the information within this modal is subject to change.
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
                    <div className="col-md-6">{modifiedData[0].PR_address}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">Coordinates</div>
                    <div className="col-md-6 text-sm text-muted">
                      <span>
                        {"("}
                        {modifiedData[0].PR_latitude}
                        {", "}
                        {modifiedData[0].PR_longitude}
                        {")"}
                      </span>
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-md-6">Date & Time</div>
                    <div className="col-md-6 text-sm">
                      {modifiedData[0].PR_timestamp
                        ? (() => {
                            const ts = modifiedData[0].PR_timestamp;
                            const parts = ts.split(" ");
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
                        `(${selectedRow[0]?.PR_user_id})`
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
                  <div className="row mb-2">
                    <div className="col-md-6">Status</div>
                    <div className="col-md-6">
                      {modifiedData[0].PR_report_status === "pending" ? (
                        <select
                          className="form-control w-75 text-xs m-0 text-white"
                          id="reportStatus"
                          style={{
                            height: "100%",
                            backgroundColor: "#1E293B",
                            border: "none",
                            borderRadius: "1rem",
                            padding: "0.25rem 0.5rem",
                          }}
                          value={modifiedData[0].PR_report_status}
                          onChange={(e) =>
                            setModifiedData([
                              {
                                ...modifiedData[0],
                                PR_report_status: e.target
                                  .value as ReportStatus,
                              },
                              modifiedData[1],
                            ])
                          }
                        >
                          {REPORT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>
                          {REPORT_STATUS_OPTIONS.find(
                            (opt) =>
                              opt.value === modifiedData[0].PR_report_status
                          )?.label || modifiedData[0].PR_report_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">Validated?</div>
                    <div className="col-md-6">
                      {modifiedData[0].PR_verified ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                {/* MEDIA PREVIEW */}
                <div
                  className="col-md-4 d-flex flex-column p-0"
                  style={{ height: "" }}
                >
                  <div
                    className={`card mb-0 flex-grow-1 bg-dark`}
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
              {/* POSTVALIDATION INTRO */}
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
                    intervention for validation, the report contains the
                    following data below.
                  </p>
                </div>
              </div>
              {/* POST VALIDATION  */}
              {modifiedData[0].PR_report_status !== "pending" && (
                <div
                  className="mt-2 px-4 py-3"
                  style={{
                    background: "#181f3a",
                    borderRadius: "1rem",
                    color: "#fff",
                    fontSize: "0.95rem",
                  }}
                >
                  <div className="row mb-2 align-items-center">
                    <div className="col-md-6 text-sm">Confidence Score</div>
                    <div className="col-md-6 text-sm">
                      {modifiedData[1] ? (
                        <span
                          className="badge px-2 py-1"
                          style={{
                            backgroundColor: "#334155",
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: "0.5rem",
                            fontSize: "0.95rem",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {modifiedData[1].VR_confidence_score}%
                        </span>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={0.01}
                            className="custom-range"
                            style={{
                              width: "80%",
                              accentColor: "#f97316",
                              background: "#232b4d",
                              borderRadius: "0.5rem",
                              height: "6px",
                            }}
                            value={manualPostverified.VR_confidence_score}
                            onChange={(e) =>
                              setManualPostverified({
                                ...manualPostverified,
                                VR_confidence_score: parseFloat(e.target.value),
                              })
                            }
                          />
                          <span
                            className="ml-3 px-2 py-1 text-sm"
                            style={{
                              background: "#232b4d",
                              color: "#f97316",
                              borderRadius: "0.5rem",
                              minWidth: "48px",
                              textAlign: "center",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {manualPostverified.VR_confidence_score}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row mb-2 align-items-center">
                    <div className="col-md-6 text-sm ">Detected</div>
                    {/* Note: Just set detected value when submitting the manual postverified report */}
                    <div className="col-md-6 text-sm">
                      {modifiedData[1] ? (
                        modifiedData[1].VR_detected ? (
                          <span className="text-success">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-1"
                            />
                            Yes
                          </span>
                        ) : (
                          <span className="text-danger">
                            <FontAwesomeIcon icon={faBan} className="mr-1" />
                            No
                          </span>
                        )
                      ) : modifiedData[0].PR_report_status === "verified" ||
                        modifiedData[0].PR_report_status === "resolved" ? (
                        <span className="text-success">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1"
                          />
                          Yes
                        </span>
                      ) : modifiedData[0].PR_report_status === "false_alarm" ? (
                        <span className="text-danger">
                          <FontAwesomeIcon icon={faBan} className="mr-1" />
                          No
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div
                    className="row mb-2 align-items-center"
                    style={{
                      display:
                        modifiedData[0].PR_report_status === "false_alarm"
                          ? "none"
                          : undefined,
                    }}
                  >
                    <div className="col-md-6 text-sm">Severity Level</div>
                    <div className="col-md-6 text-sm">
                      {modifiedData[1] ? (
                        generateVisualBadge(modifiedData[1].VR_severity_level)
                      ) : (
                        <div>
                          {SEVERITY_OPTIONS.map((opt) => (
                            <label key={opt.value} className="mr-2">
                              <input
                                type="radio"
                                name="severity"
                                value={opt.value}
                                checked={
                                  manualPostverified.VR_severity_level ===
                                  opt.value
                                }
                                onChange={() =>
                                  setManualPostverified({
                                    ...manualPostverified,
                                    VR_severity_level:
                                      opt.value as SeverityLevel,
                                  })
                                }
                                className="mr-1"
                              />
                              {generateVisualBadge(opt.value)}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="row mb-2 align-items-center"
                    style={{
                      display:
                        modifiedData[0].PR_report_status === "false_alarm"
                          ? "none"
                          : undefined,
                    }}
                  >
                    <div className="col-md-6 text-sm">Spread Potential</div>
                    <div className="col-md-6 text-sm">
                      {modifiedData[1] ? (
                        generateVisualBadge(modifiedData[1].VR_spread_potential)
                      ) : (
                        <div>
                          {SPREAD_OPTIONS.map((opt) => (
                            <label key={opt.value} className="mr-2">
                              <input
                                type="radio"
                                name="spread"
                                value={opt.value}
                                checked={
                                  manualPostverified.VR_spread_potential ===
                                  opt.value
                                }
                                onChange={() =>
                                  setManualPostverified({
                                    ...manualPostverified,
                                    VR_spread_potential:
                                      opt.value as SpreadPotential,
                                  })
                                }
                                className="mr-1"
                              />
                              {generateVisualBadge(opt.value)}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="row mb-2 align-items-center"
                    style={{
                      display:
                        modifiedData[0].PR_report_status === "false_alarm"
                          ? "none"
                          : undefined,
                    }}
                  >
                    <div className="col-md-6 text-sm">Fire Type</div>
                    <div className="col-md-6 text-sm">
                      {modifiedData[1] ? (
                        generateVisualBadge(modifiedData[1].VR_fire_type)
                      ) : (
                        <div>
                          {FIRE_TYPE_OPTIONS.map((opt) => (
                            <label key={opt.value} className="mr-2">
                              <input
                                type="radio"
                                name="fireType"
                                value={opt.value}
                                checked={
                                  manualPostverified.VR_fire_type === opt.value
                                }
                                onChange={() =>
                                  setManualPostverified({
                                    ...manualPostverified,
                                    VR_fire_type: opt.value,
                                  })
                                }
                                className="mr-1"
                              />
                              {generateVisualBadge(opt.label)}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div
            className="modal-footer justify-content-right"
            style={{ border: "none" }}
          >
            <button
              className={`btn btm-sm btn-muted bg-orange ml-2 ${
                !hasChanges ? "disabled" : ""
              }`}
              onClick={handleNewDataSubmission}
              disabled={!hasChanges}
            >
              <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
              Save
            </button>
            <button
              className={`btn btm-sm btn-muted bg-dark ml-2 ${
                !hasChanges ? "disabled" : ""
              }`}
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
              Reset
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger ml-2"
              style={{ backgroundColor: "#dc3545", border: "none" }}
              onClick={handleInvalidatePostverification}
              disabled={!modifiedData || !modifiedData[1]}
            >
              <FontAwesomeIcon icon={faBan} className="mr-2" />
              Invalidate
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary ml-2"
              onClick={handleExitClick}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
              Exit Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportEditModal;
