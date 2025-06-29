import {
  faFloppyDisk,
  faRightFromBracket,
  faRotateLeft,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import type { UserRole } from "../../constants/types/types";
import { useSession } from "../../constants/context/SessionContext";
import type { UserAccount } from "../../constants/types/database";
import axios from "axios";
import { SERVER_LINK } from "../../constants/netvar";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

interface UserEditModalProps {
  showSelectedModal: boolean;
  selectedRow: UserAccount | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<UserAccount | null>>;
  handleExitClick: () => void;
}

const UserEditModal = ({
  showSelectedModal,
  selectedRow,
  handleExitClick,
}: UserEditModalProps) => {
  const { sessionData } = useSession();
  const { refreshAll } = useAdminSQL();

  const [modifiedData, setModifiedData] = useState<UserAccount | null>(
    selectedRow
  );
  const [hasChanges, setHasChanges] = useState(false);

  const roleOptions: UserRole[] = [
    "civilian",
    "responder",
    ...(sessionData?.UA_user_role == "superadmin"
      ? (["admin"] as UserRole[])
      : []),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!modifiedData) return;
    const { id, value } = e.target;
    const keyMap: Record<string, keyof UserAccount> = {
      inputFirstName: "UA_first_name",
      inputMiddleName: "UA_middle_name",
      inputLastName: "UA_last_name",
      inputSuffix: "UA_suffix",
      inputEmailAddress: "UA_email_address",
      inputPhoneNumber: "UA_phone_number",
      inputReputationScore: "UA_reputation_score",
      userRole: "UA_user_role",
    };
    const userKey = keyMap[id];
    if (!userKey) return;
    setModifiedData((prev) =>
      prev
        ? {
            ...prev,
            [userKey]:
              userKey === "UA_reputation_score" ? Number(value) : value,
          }
        : prev
    );
  };

  const handleComparison = () => {
    if (!selectedRow || !modifiedData) {
      setHasChanges(false);
      return;
    }
    const safeCompare = (a: any, b: any) => (a || "") === (b || "");
    const changed =
      !safeCompare(selectedRow.UA_first_name, modifiedData.UA_first_name) ||
      !safeCompare(selectedRow.UA_middle_name, modifiedData.UA_middle_name) ||
      !safeCompare(selectedRow.UA_last_name, modifiedData.UA_last_name) ||
      !safeCompare(selectedRow.UA_suffix, modifiedData.UA_suffix) ||
      !safeCompare(
        selectedRow.UA_email_address,
        modifiedData.UA_email_address
      ) ||
      !safeCompare(selectedRow.UA_phone_number, modifiedData.UA_phone_number) ||
      !safeCompare(selectedRow.UA_user_role, modifiedData.UA_user_role) ||
      Number(selectedRow.UA_reputation_score) !==
        Number(modifiedData.UA_reputation_score);
    setHasChanges(changed);
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

  const handleReset = () => {
    setModifiedData(selectedRow);
  };

  const handleNewDataSubmission = async () => {
    if (!modifiedData) return;

    const payload = {
      UA_user_id: modifiedData.UA_user_id,
      UA_username: modifiedData.UA_username || "",
      UA_first_name: modifiedData.UA_first_name || "",
      UA_middle_name: modifiedData.UA_middle_name || "",
      UA_last_name: modifiedData.UA_last_name || "",
      UA_suffix: modifiedData.UA_suffix || "",
      UA_email_address: modifiedData.UA_email_address || null,
      UA_phone_number: modifiedData.UA_phone_number || null,
      UA_reputation_score: modifiedData.UA_reputation_score || 0,
      UA_user_role: modifiedData.UA_user_role || "civilian",
      UA_created_at:
        new Date(modifiedData.UA_created_at)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ") || "",
    };

    try {
      const response = await axios.post(`${SERVER_LINK}/user/update`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        alert("User updated successfully!");
        refreshAll();
        handleExitClick();
      } else {
        alert("Failed to update user.");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  useEffect(() => {
    setModifiedData(selectedRow);
  }, [selectedRow, showSelectedModal]);

  useEffect(() => {
    handleComparison();
  }, [modifiedData, selectedRow]);

  return (
    <div
      className={`modal fade ${showSelectedModal ? "show d-block" : "d-none"}`}
      id="modal-lg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1050,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="modal-dialog modal-lg"
        style={{
          margin: "30px auto",
        }}
      >
        <div
          className="modal-content"
          style={{
            backgroundColor: "rgb(17, 22, 43)",
            borderRadius: "1rem",
            maxHeight: "90vh",
          }}
        >
          {" "}
          {modifiedData && (
            <div className="modal-body p-4" style={{ overflowY: "scroll" }}>
              <h5
                className="box-title mt-1 text-bold"
                style={{ color: "rgb(194, 65, 12)" }}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                User ID {modifiedData.UA_user_id}
              </h5>
              <span className="text-muted text-sm text-bold mt-2">
                INFORMATION
              </span>
              <p className="text-sm">
                Contains all the information about the user registered within
                the system.
              </p>
              <div className="row w-100 px-2">
                <span className="text-muted text-sm text-bold">
                  ACCOUNT NAME
                </span>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>First Name</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="text"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputFirstName"
                    placeholder="First name..."
                    value={modifiedData.UA_first_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Middle Name</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="text"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputMiddleName"
                    placeholder="Middle name..."
                    value={modifiedData.UA_middle_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Last Name</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="text"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputLastName"
                    placeholder="Last name..."
                    value={modifiedData.UA_last_name || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* Suffix Option */}
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Has Suffix?</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-start align-items-center mb-0">
                  <input
                    type="checkbox"
                    id="hasSuffix"
                    checked={!!modifiedData.UA_suffix}
                    onChange={(e) => {
                      setModifiedData((prev) =>
                        prev
                          ? {
                              ...prev,
                              UA_suffix: e.target.checked
                                ? prev.UA_suffix && prev.UA_suffix !== ""
                                  ? prev.UA_suffix
                                  : " "
                                : "",
                            }
                          : prev
                      );
                    }}
                    style={{ width: "1.2em", height: "1.2em" }}
                  />
                  <label htmlFor="hasSuffix" className="ml-2 mb-0 text-sm">
                    Yes
                  </label>
                </div>
              </div>
              {modifiedData.UA_suffix && (
                <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                  <div className="col-md-6">
                    <div style={{ height: "100%" }}>Suffix</div>
                  </div>
                  <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                    <input
                      type="text"
                      className="form-control w-100 custom-input text-sm text-white"
                      id="inputSuffix"
                      placeholder="Suffix (e.g. Jr, Sr, III)..."
                      value={modifiedData.UA_suffix || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              <div className="my-2" />
              <div className="row w-100 px-2">
                <span className="text-muted text-sm text-bold">
                  CONTACT INFORMATION
                </span>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Email Address</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="email"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputEmailAddress"
                    placeholder="Email address..."
                    value={modifiedData.UA_email_address || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Phone Number</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="tel"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputPhoneNumber"
                    placeholder="Phone number..."
                    value={modifiedData.UA_phone_number || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="my-2" />
              <div className="row w-100 px-2">
                <span className="text-muted text-sm text-bold">
                  ADDITIONAL INFORMATION
                </span>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Role</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-start align-items-center text-left mb-0">
                  {roleOptions.includes(
                    modifiedData.UA_user_role as UserRole
                  ) ? (
                    <select
                      className="form-control w-100 text-sm text-white"
                      id="userRole"
                      style={{
                        backgroundColor: "#1E293B",
                        border: "none",
                        borderRadius: "1rem",
                      }}
                      value={modifiedData.UA_user_role}
                      onChange={handleInputChange}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    renderRoleBadge(modifiedData.UA_user_role)
                  )}
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Reputation Score</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <span className="text-left w-100">
                    {selectedRow?.UA_reputation_score}
                  </span>
                </div>
              </div>
              <div className="my-4" />
            </div>
          )}
          <div
            className="modal-footer justify-content-right"
            style={{ border: "none" }}
          >
            <div className="col d-flex justify-content-end">
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
    </div>
  );
};
export default UserEditModal;
