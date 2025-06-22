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

type UserType = {
  UA_user_id: number;
  UA_username: string;
  UA_password?: string;
  UA_user_role: UserRole;
  UA_created_at: string;
  UA_last_name: string;
  UA_first_name: string;
  UA_middle_name?: string;
  UA_suffix?: string;
  UA_email_address: string;
  UA_phone_number: string;
  UA_reputation_score: number;
  UA_id_picture_front?: number;
  UA_id_picture_back?: number;
};

interface UserEditModalProps {
  showSelectedModal: boolean;
  selectedRow: UserType | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<UserType | null>>;
  handleExitClick: () => void;
}

const UserEditModal = ({
  showSelectedModal,
  selectedRow,
  handleExitClick,
}: UserEditModalProps) => {
  const { sessionData } = useSession();

  const [modifiedData, setModifiedData] = useState<UserType | null>(
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
    const keyMap: Record<string, keyof UserType> = {
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

  const handleReset = () => {
    setModifiedData(selectedRow);
  };

  const handleNewDataSubmission = () => {
    // Submit logic here
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
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
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
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0">
                <div className="col-md-6">
                  <div style={{ height: "100%" }}>Reputation Score</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="number"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputReputationScore"
                    placeholder="Reputation score..."
                    value={modifiedData.UA_reputation_score}
                    onChange={handleInputChange}
                  />
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
                className={`btn btm-sm btn-muted bg-dark ml-2 ${
                  !hasChanges ? "disabled" : ""
                }`}
                onClick={handleReset}
              >
                <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
                Reset
              </button>
              <button
                className={`btn btm-sm btn-muted bg-orange ml-2 ${
                  !hasChanges ? "disabled" : ""
                }`}
                onClick={handleNewDataSubmission}
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                Save
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
