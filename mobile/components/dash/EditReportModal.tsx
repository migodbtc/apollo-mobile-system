import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text as RNText,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

// Wrapper to defensively ensure Text children are never null/undefined.
// On Android Hermes there are cases where native measurement crashes if a
// Text node receives null children; this wrapper coerces null -> empty string.
const Text: React.FC<any> = ({ children, ...props }) => {
  const safeChildren = children == null ? "" : children;
  return <RNText {...props}>{safeChildren}</RNText>;
};
import Slider from "@react-native-community/slider";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import { FontAwesome } from "@expo/vector-icons";
import SERVER_LINK from "@/constants/netvar";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

// Helper: generate current Philippine Time timestamp formatted as "YYYY-MM-DD HH:mm:ss"
const getPHTimestamp = () => {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const map: any = {};
    parts.forEach((p) => {
      if (p.type !== "literal") map[p.type] = p.value;
    });

    return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
  } catch (e) {
    // Fallback: build from Date values (note: may not respect TZ)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    // Attempt to derive Manila time by using UTC offset (+8)
    const manila = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return `${manila.getUTCFullYear()}-${pad(manila.getUTCMonth() + 1)}-${pad(
      manila.getUTCDate()
    )} ${pad(manila.getUTCHours())}:${pad(manila.getUTCMinutes())}:${pad(
      manila.getUTCSeconds()
    )}`;
  }
};

const { width, height } = Dimensions.get("window");

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Validated", value: "verified" },
  { label: "False Alarm", value: "false_alarm" },
  { label: "Resolved", value: "resolved" },
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

interface EditReportModalProps {
  visible: boolean;
  reportData: [PreverifiedReport, PostverifiedReport | null] | null;
  onClose: () => void;
  onSave: (updatedData: { status: string }) => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  visible,
  reportData,
  onClose,
  onSave,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [confidence, setConfidence] = useState(0);
  const [detected, setDetected] = useState(false);
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [spread, setSpread] = useState<string | undefined>(undefined);
  const [fireType, setFireType] = useState<string | undefined>(undefined);
  // State to track if save is attempted with no changes
  const [noChangesAttempted, setNoChangesAttempted] = useState(false);
  const [missingFieldsAlert, setMissingFieldsAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const { fetchPreverifiedReports, fetchPostverifiedReports } = useAdminSQL();
  // Keep an immutable snapshot of the initial values when the modal opens.
  // This makes change-detection deterministic (compare current state -> initial snapshot)
  const initialSnapshot = useRef<{
    selectedStatus: string;
    confidence: number;
    detected: boolean;
    severity?: string | undefined;
    spread?: string | undefined;
    fireType?: string | undefined;
    pr_report_id?: number | null;
  } | null>(null);

  useEffect(() => {
    // log the current report on the modal
    console.log("Report Data: ", reportData);

    const initStatus =
      reportData?.[0]?.PR_report_status?.toLowerCase() || "pending";
    const initConfidence = reportData?.[1]?.VR_confidence_score || 0;
    const initDetected = Boolean(reportData?.[1]?.VR_detected ?? false);
    const initSeverity = reportData?.[1]?.VR_severity_level;
    const initSpread = reportData?.[1]?.VR_spread_potential;
    const initFireType = reportData?.[1]?.VR_fire_type;

    setSelectedStatus(initStatus);
    setConfidence(initConfidence);
    setDetected(initDetected);
    setSeverity(initSeverity);
    setSpread(initSpread);
    setFireType(initFireType);

    // capture the initial snapshot for change detection
    initialSnapshot.current = {
      selectedStatus: initStatus,
      confidence: initConfidence,
      detected: initDetected,
      severity: initSeverity,
      spread: initSpread,
      fireType: initFireType,
      pr_report_id: reportData?.[0]?.PR_report_id ?? null,
    };
  }, [visible, reportData]);

  // Placeholder handler functions for requests

  const isUnchanged = () => {
    // log comparisons first before calculating for result
    console.log("isUnchanged() called");
    console.log(reportData);
    // If we don't have an initial snapshot, fallback to previous behavior
    if (!initialSnapshot.current) {
      if (!reportData) return true;
      const [pre, post] = reportData;
      const statusUnchanged =
        (pre?.PR_report_status?.toLowerCase() || "pending") === selectedStatus;
      const confidenceUnchanged =
        Number(post?.VR_confidence_score ?? 0) === Number(confidence);
      const detectedUnchanged =
        Boolean(post?.VR_detected ?? false) === Boolean(detected);
      const severityUnchanged =
        (post?.VR_severity_level?.toLowerCase() ?? "") ===
        (severity?.toLowerCase() ?? "");
      const spreadUnchanged =
        (post?.VR_spread_potential?.toLowerCase() ?? "") ===
        (spread?.toLowerCase() ?? "");
      const fireTypeUnchanged =
        (post?.VR_fire_type?.toLowerCase() ?? "") ===
        (fireType?.toLowerCase() ?? "");

      if (selectedStatus === "false_alarm") {
        return statusUnchanged && confidenceUnchanged && detectedUnchanged;
      } else if (
        selectedStatus === "verified" ||
        selectedStatus === "resolved"
      ) {
        return (
          statusUnchanged &&
          confidenceUnchanged &&
          detectedUnchanged &&
          severityUnchanged &&
          spreadUnchanged &&
          fireTypeUnchanged
        );
      } else {
        return statusUnchanged;
      }
    }

    // Compare against the captured snapshot of initial values instead of
    // the raw DB objects. This avoids mismatches caused by null/undefined
    // post objects and ensures we're comparing what the user saw on open.
    const initial = initialSnapshot.current;
    const statusUnchanged = initial.selectedStatus === selectedStatus;
    const confidenceUnchanged =
      Number(initial.confidence) === Number(confidence);
    const detectedUnchanged = Boolean(initial.detected) === Boolean(detected);
    const severityUnchanged =
      (initial.severity?.toLowerCase() ?? "") ===
      (severity?.toLowerCase() ?? "");
    const spreadUnchanged =
      (initial.spread?.toLowerCase() ?? "") === (spread?.toLowerCase() ?? "");
    const fireTypeUnchanged =
      (initial.fireType?.toLowerCase() ?? "") ===
      (fireType?.toLowerCase() ?? "");

    if (selectedStatus === "false_alarm") {
      return statusUnchanged && confidenceUnchanged && detectedUnchanged;
    }
    if (selectedStatus === "verified" || selectedStatus === "resolved") {
      return (
        statusUnchanged &&
        confidenceUnchanged &&
        detectedUnchanged &&
        severityUnchanged &&
        spreadUnchanged &&
        fireTypeUnchanged
      );
    }

    return statusUnchanged;
  };

  const generateVisualBadge = (level: string | undefined) => {
    if (level == undefined) {
      return (
        <View style={[styles.badge, styles.badgeMuted]}>
          <Text style={styles.badgeText}>None</Text>
        </View>
      );
    }

    const normalizedLevel = level.toLowerCase();

    if (["small", "mild", "low"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeSecondary]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    if (["moderate", "medium"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeWarning]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    if (["large", "severe", "high"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeDanger]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    // fallback
    return (
      <View style={[styles.badge, styles.badgeMuted]}>
        <Text style={styles.badgeText}>Unknown</Text>
      </View>
    );
  };

  const handleSave = async () => {
    // Only show missing fields alert if status is verified/resolved and any field is missing
    if (
      (selectedStatus === "verified" || selectedStatus === "resolved") &&
      (!severity || !spread || !fireType)
    ) {
      setMissingFieldsAlert(true);
      return;
    }
    setMissingFieldsAlert(false);

    if (isUnchanged()) {
      setNoChangesAttempted(true);
      return;
    }
    setNoChangesAttempted(false);

    // Defensive: prefer using the passed `reportData`; but fall back to the
    // captured initial snapshot's PR id in case the prop isn't yet available
    // due to render timing. This enables saving immediately after opening.
    let resolvedPRId: number | undefined = undefined;
    if (reportData && reportData[0] && reportData[0].PR_report_id) {
      resolvedPRId = reportData[0].PR_report_id;
    } else if (
      initialSnapshot.current &&
      initialSnapshot.current.pr_report_id
    ) {
      resolvedPRId = initialSnapshot.current.pr_report_id || undefined;
    }

    if (!resolvedPRId) {
      setSuccessAlert(
        "Missing report identifier. Please close and re-open the report before saving."
      );
      setTimeout(() => setSuccessAlert(null), 3000);
      console.error("Missing reportData or PR_report_id", reportData);
      return;
    }
    // We should update the POST-verified record directly instead of calling
    // the preverified verify endpoint — that endpoint may insert new
    // postverified rows. Send update to postverified endpoint first, then
    // update preverified metadata.
    const post_update_endpoint = `${SERVER_LINK}/reports/postverified/update`;
    const pre_update_endpoint = `${SERVER_LINK}/reports/preverified/update`;

    console.log("VR_report_id:", reportData?.[0]?.PR_report_id);
    console.log("Report Data: ", reportData);

    // Build postverified payload. Prefer sending VR_verification_id when
    // available; otherwise include VR_report_id so the server can resolve it.
    const postPayload: any = {
      VR_report_id: resolvedPRId,
      VR_confidence_score: confidence,
      VR_detected: detected ? 1 : 0,
      VR_verification_timestamp: new Date().toISOString(),
    };

    if (reportData?.[1]?.VR_verification_id) {
      postPayload.VR_verification_id = reportData[1].VR_verification_id;
    }

    // Defensive: ensure we have at least one identifier the server can use.
    if (!postPayload.VR_verification_id && !postPayload.VR_report_id) {
      setSuccessAlert(
        "Missing report identifiers (VR_verification_id or VR_report_id). Cannot update."
      );
      setTimeout(() => setSuccessAlert(null), 3000);
      console.error(
        "Attempted to update postverified without IDs",
        postPayload
      );
      return;
    }

    if (selectedStatus !== "false_alarm") {
      postPayload.VR_severity_level = severity;
      postPayload.VR_spread_potential = spread;
      postPayload.VR_fire_type = fireType;
    }

    // Build preverified payload to update status/verified flag
    const prePayload: any = {
      PR_report_id: resolvedPRId,
      PR_report_status: selectedStatus,
      PR_verified: selectedStatus === "pending" ? 0 : 1,
      PR_timestamp: getPHTimestamp(),
    };

    // log if postverified report exists
    console.log("Postverified report exists:", Boolean(reportData?.[1]));

    try {
      // If there's no existing postverified record OR the postverified record
      // doesn't have a VR_verification_id, create it via the "verify" endpoint
      // which creates/updates both preverified and postverified records atomically.
      if (!reportData?.[1] || !reportData?.[1]?.VR_verification_id) {
        console.log(
          "No VR_verification_id found — creating postverified via verify endpoint"
        );
        // Build payload similar to web admin: [preverified, postverified]
        // Generate a client-side unique VR_verification_id (use negative ids
        // to avoid colliding with DB auto-increment values). We fetch the
        // existing postverified list and pick the next negative integer.
        let newVerificationId: number | undefined = undefined;
        try {
          const existingResp = await fetch(
            `${SERVER_LINK}/reports/postverified/all`
          );
          if (existingResp.ok) {
            const existingList = await existingResp.json();
            if (Array.isArray(existingList) && existingList.length > 0) {
              const ids = existingList
                .map((r: any) => Number(r.VR_verification_id))
                .filter((n: number) => !Number.isNaN(n));
              const negIds = ids.filter((n: number) => n < 0);
              newVerificationId = negIds.length ? Math.min(...negIds) - 1 : -1;
            } else {
              newVerificationId = -1;
            }
          } else {
            newVerificationId = -1;
          }
        } catch (err) {
          console.warn(
            "Failed to fetch existing postverified list, falling back to -1",
            err
          );
          newVerificationId = -1;
        }
        // Prefer full preverified object when available; otherwise send a
        // minimal object with the report id and updated status so the
        // server can resolve the row.
        const preverifiedPayload: any = {
          PR_report_id: resolvedPRId,
          PR_user_id: reportData?.[0]?.PR_user_id,
          PR_image: reportData?.[0]?.PR_image,
          PR_video: reportData?.[0]?.PR_video,
          PR_latitude: reportData?.[0]?.PR_latitude,
          PR_longitude: reportData?.[0]?.PR_longitude,
          PR_address: reportData?.[0]?.PR_address,
          PR_verified: selectedStatus === "pending" ? 0 : 1,
          PR_report_status: selectedStatus,
          PR_timestamp: getPHTimestamp(),
        };

        const postverifiedPayload: any = {
          VR_verification_id: newVerificationId,
          VR_report_id: resolvedPRId,
          VR_confidence_score: confidence,
          VR_detected: detected ? 1 : 0,
          VR_verification_timestamp: new Date().toISOString(),
        };

        if (selectedStatus !== "false_alarm") {
          postverifiedPayload.VR_severity_level = severity;
          postverifiedPayload.VR_spread_potential = spread;
          postverifiedPayload.VR_fire_type = fireType;
        }

        console.log("Creating new postverified via verify endpoint:", {
          preverifiedPayload,
          postverifiedPayload,
        });

        const verifyResponse = await fetch(
          `${SERVER_LINK}/reports/preverified/one/verify`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([preverifiedPayload, postverifiedPayload]),
          }
        );

        const verifyData = await verifyResponse.json();
        console.log("Verify response:", verifyData);

        if (!verifyResponse.ok) {
          setSuccessAlert(
            verifyData?.error || "Failed to create verification."
          );
          setTimeout(() => setSuccessAlert(null), 2000);
          return;
        }

        setSuccessAlert("Report verified successfully!");
        setTimeout(() => {
          setSuccessAlert(null);
          // notify parent
          try {
            onSave && onSave({ status: selectedStatus });
          } catch (err) {
            console.warn("onSave threw:", err);
          }
          onClose();
        }, 1200);
        // refresh lists
        fetchPreverifiedReports().then(() => fetchPostverifiedReports());
        return;
      }

      // 1) Update postverified (existing record)
      console.log("Sending postverified update:", postPayload);
      const postResponse = await fetch(post_update_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });

      const postData = await postResponse.json();
      console.log("Received postverified response:", postData);

      if (!postResponse.ok) {
        setSuccessAlert(postData?.error || "Failed to update verification.");
        setTimeout(() => setSuccessAlert(null), 2000);
        return;
      }

      // 2) Update preverified status
      const preResponse = await fetch(pre_update_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prePayload),
      });

      const preData = await preResponse.json();

      if (!preResponse.ok) {
        setSuccessAlert(preData?.error || "Failed to update report status.");
        setTimeout(() => setSuccessAlert(null), 2000);
        return;
      }

      // Success
      setSuccessAlert("Report updated successfully!");
      setTimeout(() => {
        setSuccessAlert(null);
        // notify parent of update
        try {
          onSave && onSave({ status: selectedStatus });
        } catch (err) {
          console.warn("onSave threw:", err);
        }
        onClose();
      }, 1200);
      console.log(
        "Post update response:",
        postData,
        "Pre update response:",
        preData
      );
    } catch (e) {
      setSuccessAlert("Network error. Please try again.");
      setTimeout(() => setSuccessAlert(null), 2000);
      console.error(e);
    } finally {
      console.log("Finishing up...");
      fetchPreverifiedReports().then(() => fetchPostverifiedReports());
    }
  };

  const handleReset = () => {
    setSelectedStatus(
      reportData?.[0]?.PR_report_status?.toLowerCase() || "pending"
    );
    setConfidence(reportData?.[1]?.VR_confidence_score || 0);
    setDetected(reportData?.[1]?.VR_detected ?? false);
    setSeverity(reportData?.[1]?.VR_severity_level);
    setSpread(reportData?.[1]?.VR_spread_potential);
    setFireType(reportData?.[1]?.VR_fire_type);
    setNoChangesAttempted(false);
    setMissingFieldsAlert(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Report Status</Text>
          <Text style={{ color: "white", marginBottom: height * 0.01 }}>
            Update the status of the report manually here.
          </Text>

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.radioRow}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioButton}
                onPress={() => {
                  setSelectedStatus(option.value);
                  setNoChangesAttempted(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.radioCircle}>
                  {selectedStatus === option.value && (
                    <View style={styles.selectedRb} />
                  )}
                </View>
                <Text style={styles.radioText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditional UI for status */}
          {(selectedStatus === "false_alarm" ||
            selectedStatus === "verified" ||
            selectedStatus === "resolved") && (
            <>
              <Text style={styles.sectionLabel}>Confidence Score</Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 16,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    width: "20%",
                    color: "white",
                    fontSize: width * 0.04,
                    marginBottom: 2,
                  }}
                >
                  {confidence}%
                </Text>
                <Slider
                  style={{ width: "80%", height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={confidence}
                  minimumTrackTintColor="#f97316"
                  maximumTrackTintColor="#334155"
                  thumbTintColor="#f97316"
                  onValueChange={setConfidence}
                />
              </View>
            </>
          )}

          {(selectedStatus === "verified" || selectedStatus === "resolved") && (
            <>
              <Text style={styles.sectionLabel}>Detected</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setDetected(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {detected && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setDetected(false)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {!detected && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionLabel}>Severity Level</Text>
              <View style={[styles.optionRow]}>
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setSeverity(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {severity === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {generateVisualBadge(option.label)}
                      <Text style={[styles.radioText, { marginLeft: 8 }]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Spread Potential</Text>
              <View style={styles.optionRow}>
                {SPREAD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setSpread(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {spread === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {generateVisualBadge(option.label)}
                      <Text style={[styles.radioText, { marginLeft: 8 }]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Fire Type</Text>
              <View style={styles.optionRow}>
                {FIRE_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setFireType(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {fireType === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {generateVisualBadge(option.label)}
                      <Text style={[styles.radioText, { marginLeft: 8 }]}>
                        {option.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {noChangesAttempted && (
            <View style={styles.alertBox}>
              <FontAwesome
                name="exclamation-circle"
                size={20}
                color="#f87171"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.alertText}>
                No changes detected. Please modify a field before saving.
              </Text>
            </View>
          )}
          {missingFieldsAlert && (
            <View style={styles.alertBox}>
              <FontAwesome
                name="exclamation-triangle"
                size={20}
                color="#facc15"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.alertText}>
                Please select Severity Level, Spread Potential, and Fire Type
                before saving.
              </Text>
            </View>
          )}
          {successAlert && (
            <View style={styles.successBox}>
              <FontAwesome
                name="check-circle"
                size={20}
                color="#10b981"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.alertText, { color: "#D1FAE5" }]}>
                {successAlert}
              </Text>
            </View>
          )}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: width * 0.02,
              marginTop: height * 0.02,
            }}
          >
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f97316",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="save" size={20} color="#fff" />
                {"  "}
                SAVE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#6c757d",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="refresh" size={20} color="#fff" />
                {"  "}RESET
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#42475A",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="times" size={20} color="#fff" />
                {"  "}CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.015,
    marginTop: 2,
    flexWrap: "wrap",
    gap: 12,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#991b1b", // darker version of #f87171
    borderColor: "#991b1b",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
    justifyContent: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064E3B",
    borderColor: "#065F46",
    borderWidth: 1.2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
    justifyContent: "center",
  },
  alertText: {
    color: "white",
    fontSize: width * 0.037,
    textAlign: "left",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#f97316",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: height * 0.01,
  },
  sectionLabel: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    marginTop: height * 0.01,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: height * 0.015,
    justifyContent: "space-between",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    marginBottom: 8,
    minWidth: width * 0.32,
  },
  radioButtonAlt: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    minWidth: width * 0.28,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },
  radioText: {
    color: "#E2E8F0",
    fontSize: width * 0.037,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#334155",
    color: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: width * 0.037,
    marginBottom: height * 0.02,
    marginTop: 2,
    minHeight: 48,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.042,
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  badgeMuted: {
    backgroundColor: "#64748b",
  },
  badgeSecondary: {
    backgroundColor: "#38bdf8",
  },
  badgeWarning: {
    backgroundColor: "#facc15",
  },
  badgeDanger: {
    backgroundColor: "#ef4444",
  },
});

export default EditReportModal;
