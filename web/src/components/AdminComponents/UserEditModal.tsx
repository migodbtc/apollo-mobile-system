import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
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
  setSelectedRow,
  handleExitClick,
}: UserEditModalProps) => {
  const { sessionData } = useSession();

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

  const roleOptions: UserRole[] = [
    "civilian",
    "responder",
    ...(sessionData?.UA_user_role == "superadmin"
      ? (["admin"] as UserRole[])
      : []),
  ];

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
          {selectedRow && (
            <div className="modal-body p-4" style={{ overflowY: "scroll" }}>
              <h5
                className="box-title mt-1 text-bold"
                style={{ color: "rgb(194, 65, 12)" }}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                User ID {selectedRow.UA_user_id}
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
                    value={selectedRow?.UA_user_role || ""}
                    onChange={(e) => {
                      setSelectedRow({
                        ...selectedRow,
                        UA_user_role: e.target.value as UserRole,
                      });
                    }}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {renderRoleBadge(role)}
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
                  <span className="text-left w-100 text-sm mb-2 mt-1">
                    <input
                      type="number"
                      className="form-control w-100 custom-input text-sm text-white"
                      id="inputReputationScore"
                      placeholder="Reputation score..."
                    />
                  </span>
                </div>
              </div>
              <div className="my-2" />
              <div className="row w-100 px-2">
                <span className="text-muted text-sm text-bold">
                  IDENTITY VALIDATION
                </span>
              </div>
              <div className="row w-100 px-2 mt-2 d-flex justify-content-center align-items-center text-left py-0">
                <div className="col-md-6">
                  <div>Front ID Picture</div>
                </div>
                <div className="col-md-6">
                  <div>Back ID Picture</div>
                </div>
              </div>
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-2">
                <div className="col-md-6 form-group d-flex flex-column align-items-center mb-0">
                  <input
                    type="file"
                    className="form-control w-100 text-sm text-white"
                    id="inputFrontIdPicture"
                    style={{
                      backgroundColor: "#1E293B",
                      border: "none",
                      borderRadius: "1rem",
                    }}
                  />
                  {true ? (
                    <span className="text-green-500 w-100 text-xs ml-2 pl-2">
                      Uploaded: filename...
                    </span>
                  ) : null}
                </div>
                <div className="col-md-6 form-group d-flex flex-column align-items-center mb-0">
                  <input
                    type="file"
                    className="form-control w-100 text-sm text-white "
                    id="inputBackIdPicture"
                    style={{
                      backgroundColor: "#1E293B",
                      border: "none",
                      borderRadius: "1rem",
                    }}
                  />
                  {true ? (
                    <span className="text-green-500 w-100 text-xs ml-2 pl-2">
                      Uploaded: filename...
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="my-4" />
            </div>
          )}
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
              onClick={handleExitClick}
            >
              {"  "}Exit Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
