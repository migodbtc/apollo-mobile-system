import {
  faFloppyDisk,
  faRightFromBracket,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import type { UserRole } from "../../constants/types/types";
import axios from "axios";
import { SERVER_LINK } from "../../constants/netvar";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import { useSession } from "../../constants/context/SessionContext";
import type { UserAccount } from "../../constants/types/database";

interface UserCreateModalProps {
  showCreateModal: boolean;
  handleExitClick: () => void;
}

const defaultUser = {
  UA_user_id: -1,
  UA_username: "",
  UA_password: "",
  UA_first_name: "",
  UA_middle_name: "",
  UA_last_name: "",
  UA_suffix: "",
  UA_email_address: "",
  UA_phone_number: "",
  UA_reputation_score: 0,
  UA_user_role: "civilian" as UserRole,
  UA_created_at: "",
};

const UserCreateModal = ({
  showCreateModal,
  handleExitClick,
}: UserCreateModalProps) => {
  const { sessionData } = useSession();
  const { userAccounts, refreshAll } = useAdminSQL();

  const [newUser, setNewUser] = useState<UserAccount>({ ...defaultUser });
  const [hasChanges, setHasChanges] = useState(false);

  const roleOptions: UserRole[] = [
    "civilian",
    "responder",
    ...(sessionData?.UA_user_role == "superadmin"
      ? (["admin"] as UserRole[])
      : []),
  ];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    const keyMap: Record<string, keyof typeof defaultUser> = {
      inputUsername: "UA_username",
      inputPassword: "UA_password",
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
    setNewUser((prev) => ({
      ...prev,
      [userKey]: userKey === "UA_reputation_score" ? Number(value) : value,
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setNewUser({ ...defaultUser });
    setHasChanges(false);
  };

  const handleCreateUser = async () => {
    if (newUser.UA_email_address && !validateEmail(newUser.UA_email_address)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (
      !newUser.UA_username ||
      !newUser.UA_password ||
      !newUser.UA_email_address
    ) {
      alert(
        "Please fill in all required fields: Username, Password, and Email Address."
      );
      return;
    }

    const existingUser = userAccounts.find(
      (user) => user.UA_username === newUser.UA_username
    );
    const existingEmail = userAccounts.find(
      (user) => user.UA_email_address === newUser.UA_email_address
    );

    if (existingUser) {
      alert("Username already exists. Please choose a different username.");
      return;
    }
    if (existingEmail) {
      alert("Email address already exists. Please use a different email.");
      return;
    }

    if (newUser.UA_password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    const confirmMsg = `
Please confirm the following information:

Username: ${newUser.UA_username}
Password: (hidden)
Name: ${newUser.UA_first_name} ${newUser.UA_middle_name} ${newUser.UA_last_name} ${newUser.UA_suffix}
Email: ${newUser.UA_email_address}
Phone: ${newUser.UA_phone_number}
Role: ${newUser.UA_user_role}
Reputation Score: ${newUser.UA_reputation_score}

Is this information correct?
  `.trim();

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      console.log("[DEBUG] Creating user with data:", newUser);

      const payload = {
        ...newUser,
        UA_created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      const response = await axios.post(`${SERVER_LINK}/user/add`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const user_id = response.data?.user_id;

      const payload_2 = {
        UA_user_id: user_id,
      };

      const response_2 = await axios.post(
        `${SERVER_LINK}/user/update/confidence`,
        payload_2,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response_2.status >= 200 && response_2.status < 300) {
        alert("User created successfully!");
        refreshAll();
        handleExitClick();
        handleReset();
      } else {
        alert("Failed to update user reputation score.");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user. Please try again.");
    }
  };

  return (
    <div
      className={`modal fade ${showCreateModal ? "show d-block" : "d-none"}`}
      id="modal-create-user"
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
          <div className="modal-body p-4" style={{ overflowY: "scroll" }}>
            <h5
              className="box-title mt-1 text-bold"
              style={{ color: "rgb(194, 65, 12)" }}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Create New User
            </h5>
            <span className="text-muted text-sm text-bold mt-2">
              INFORMATION
            </span>
            <p className="text-sm">
              Fill out the form below to register a new user in the system.
            </p>
            <div className="row w-100 px-2">
              <span className="text-muted text-sm text-bold">
                ACCOUNT DETAILS
              </span>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Username</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="text"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputUsername"
                  placeholder="Username..."
                  value={newUser.UA_username}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Password</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="password"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputPassword"
                  placeholder="Password..."
                  value={newUser.UA_password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      UA_password: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>First Name</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="text"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputFirstName"
                  placeholder="First name..."
                  value={newUser.UA_first_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Middle Name</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="text"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputMiddleName"
                  placeholder="Middle name..."
                  value={newUser.UA_middle_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Last Name</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="text"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputLastName"
                  placeholder="Last name..."
                  value={newUser.UA_last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            {/* Suffix Option */}
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Has Suffix?</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-start align-items-center mb-0">
                <input
                  type="checkbox"
                  id="hasSuffix"
                  checked={!!newUser.UA_suffix}
                  onChange={(e) => {
                    setNewUser((prev) => ({
                      ...prev,
                      UA_suffix: e.target.checked
                        ? prev.UA_suffix && prev.UA_suffix !== ""
                          ? prev.UA_suffix
                          : " "
                        : "",
                    }));
                    setHasChanges(true);
                  }}
                  style={{ width: "1.2em", height: "1.2em" }}
                />
                <label htmlFor="hasSuffix" className="ml-2 mb-0 text-sm">
                  Yes
                </label>
              </div>
            </div>
            {newUser.UA_suffix && (
              <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
                <div className="col-md-6">
                  <div>Suffix</div>
                </div>
                <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                  <input
                    type="text"
                    className="form-control w-100 custom-input text-sm text-white"
                    id="inputSuffix"
                    placeholder="Suffix (e.g. Jr, Sr, III)..."
                    value={newUser.UA_suffix}
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
                <div>Email Address</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="email"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputEmailAddress"
                  placeholder="Email address..."
                  value={newUser.UA_email_address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row w-100 px-2 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div>Phone Number</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="tel"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputPhoneNumber"
                  placeholder="Phone number..."
                  value={newUser.UA_phone_number}
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
                <div>Role</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-start align-items-center text-left mb-0">
                <select
                  className="form-control w-100 text-sm text-white"
                  id="userRole"
                  style={{
                    backgroundColor: "#1E293B",
                    border: "none",
                    borderRadius: "1rem",
                  }}
                  value={newUser.UA_user_role}
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
                <div>Reputation Score</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <span
                  className="form-control w-100 custom-input mt-1 text-sm text-white"
                  id="inputReputationScore"
                >
                  {newUser.UA_reputation_score}{" "}
                  <span className="text-muted text-sm">
                    (by default, calculated depending on inputs)
                  </span>
                </span>
              </div>
            </div>
            <div className="my-4" />
          </div>
          <div
            className="modal-footer justify-content-right"
            style={{ border: "none" }}
          >
            <div className="col d-flex justify-content-end">
              <button
                className={`btn btm-sm btn-muted bg-orange ml-2 ${
                  !hasChanges ? "disabled" : ""
                }`}
                onClick={handleCreateUser}
                disabled={!hasChanges}
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                Create
              </button>
              <button
                className={`btn btm-sm btn-muted bg-dark ml-2 ${
                  !hasChanges ? "disabled" : ""
                }`}
                onClick={handleReset}
                disabled={!hasChanges}
              >
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

export default UserCreateModal;
