import {
  faEnvelope,
  faFloppyDisk,
  faRotateLeft,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "../../constants/context/SessionContext";
import type { UserAccount } from "../../constants/interfaces/interface";
import { useEffect, useState } from "react";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

const AdminProfilePage = () => {
  const { sessionData } = useSession();
  const { userAccounts } = useAdminSQL();
  const userSessionData = userAccounts.find(
    (user) => user.UA_user_id === sessionData?.UA_user_id
  );

  const [modifiedData, setModifiedData] = useState<UserAccount>(
    userSessionData
      ? {
          UA_user_id: userSessionData.UA_user_id,
          UA_username: userSessionData.UA_username,
          UA_user_role: userSessionData.UA_user_role,
          UA_created_at: userSessionData.UA_created_at,
          UA_last_name: userSessionData.UA_last_name,
          UA_first_name: userSessionData.UA_first_name,
          UA_middle_name: userSessionData.UA_middle_name,
          UA_suffix: userSessionData.UA_suffix,
          UA_email_address: userSessionData.UA_email_address,
          UA_phone_number: userSessionData.UA_phone_number,
          UA_reputation_score: userSessionData.UA_reputation_score,
        }
      : {
          UA_user_id: -1,
          UA_username: "",
          UA_user_role: "civilian",
          UA_created_at: "",
          UA_last_name: "",
          UA_first_name: "",
          UA_middle_name: "",
          UA_suffix: "",
          UA_email_address: "",
          UA_phone_number: "",
          UA_reputation_score: 0,
        }
  );
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasSuffix, setHasSuffix] = useState(!!userSessionData?.UA_suffix);

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
      <div
        style={{
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: "1rem",
        }}
        className="text-center"
      >
        <span
          style={{
            color: badgeStyle.color,
          }}
          className="text-sm text-bold p-3"
        >
          {badgeText}
        </span>
      </div>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const keyMap: Record<string, keyof UserAccount> = {
      inputFirstName: "UA_first_name",
      inputMiddleName: "UA_middle_name",
      inputLastName: "UA_last_name",
      inputSuffix: "UA_suffix",
      inputEmailAddress: "UA_email_address",
      inputPhoneNumber: "UA_phone_number",
    };

    const userAccountKey = keyMap[id];

    if (userAccountKey) {
      setModifiedData((prevData) => ({
        ...prevData,
        [userAccountKey]: value,
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "UA_id_picture_front" | "UA_id_picture_back"
  ) => {
    const file = e.target.files?.[0];

    if (field === "UA_id_picture_front") {
      setFrontIdFile(file || null);
    } else {
      setBackIdFile(file || null);
    }

    setModifiedData((prevData) => ({
      ...prevData,
      [field]: file,
    }));
    handleComparison();
  };

  const handleReset = () => {
    if (userSessionData) {
      setModifiedData({
        UA_user_id: userSessionData.UA_user_id,
        UA_username: userSessionData.UA_username,
        UA_user_role: userSessionData.UA_user_role,
        UA_created_at: userSessionData.UA_created_at,
        UA_last_name: userSessionData.UA_last_name,
        UA_first_name: userSessionData.UA_first_name,
        UA_middle_name: userSessionData.UA_middle_name,
        UA_suffix: userSessionData.UA_suffix,
        UA_email_address: userSessionData.UA_email_address,
        UA_phone_number: userSessionData.UA_phone_number,
        UA_reputation_score: userSessionData.UA_reputation_score,
        UA_id_picture_front: userSessionData.UA_id_picture_front,
        UA_id_picture_back: userSessionData.UA_id_picture_back,
      });
      setHasSuffix(!!userSessionData.UA_suffix);
    }
    setFrontIdFile(null);
    setBackIdFile(null);
  };

  const handleNewDataSubmission = () => {};

  const handleComparison = () => {
    const areDataEqual = () => {
      if (!sessionData) return true;

      const safeCompare = (a: any, b: any) => (a || "") === (b || "");

      return (
        safeCompare(sessionData.UA_first_name, modifiedData.UA_first_name) &&
        safeCompare(sessionData.UA_middle_name, modifiedData.UA_middle_name) &&
        safeCompare(sessionData.UA_last_name, modifiedData.UA_last_name) &&
        safeCompare(sessionData.UA_suffix, modifiedData.UA_suffix) &&
        safeCompare(
          sessionData.UA_email_address,
          modifiedData.UA_email_address
        ) &&
        safeCompare(sessionData.UA_phone_number, modifiedData.UA_phone_number)
      );
    };

    const newHasChanges =
      !areDataEqual() || frontIdFile !== null || backIdFile !== null;
    setHasChanges(newHasChanges);
  };

  useEffect(() => {
    if (!userSessionData) {
      setHasChanges(false);
      return;
    }
    const safeCompare = (a: any, b: any) => (a || "") === (b || "");
    const changed =
      !safeCompare(userSessionData.UA_first_name, modifiedData.UA_first_name) ||
      !safeCompare(
        userSessionData.UA_middle_name,
        modifiedData.UA_middle_name
      ) ||
      !safeCompare(userSessionData.UA_last_name, modifiedData.UA_last_name) ||
      !safeCompare(userSessionData.UA_suffix, modifiedData.UA_suffix) ||
      !safeCompare(
        userSessionData.UA_email_address,
        modifiedData.UA_email_address
      ) ||
      !safeCompare(
        userSessionData.UA_phone_number,
        modifiedData.UA_phone_number
      ) ||
      !safeCompare(userSessionData.UA_user_role, modifiedData.UA_user_role) ||
      Number(userSessionData.UA_reputation_score) !==
        Number(modifiedData.UA_reputation_score) ||
      frontIdFile !== null ||
      backIdFile !== null;
    setHasChanges(changed);
  }, [modifiedData, userSessionData, frontIdFile, backIdFile]);

  return (
    <div
      className="container-fluid"
      style={{ height: "90vh", overflowY: "hidden" }}
    >
      <div className="row w-100" style={{ height: "100%" }}>
        <div className="col-md-4">
          <div
            className="d-flex justify-content-start align-items-end text-left pb-2"
            style={{ height: "10vh" }}
          >
            <h5 className="box-title" style={{ color: "rgb(194, 65, 12)" }}>
              User Information
            </h5>
          </div>

          <div
            className="card p-4 text-black d-flex flex-column align-items-center justify-content-center text-center"
            style={{
              height: "75vh",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div
              id="adminProfilePicture"
              className="profile-user-img img-fluid img-circle"
              style={{ width: 128, aspectRatio: 1 }}
            ></div>
            <h5 className="mt-3">{`@${sessionData?.UA_username}`}</h5>
            {renderRoleBadge(sessionData?.UA_user_role)}
            <div className="row w-100 mt-5 text-right">
              <div
                className="col-md-2 text-bold text-lg"
                style={{ color: "rgb(194, 65, 12)" }}
              >
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="col-md-10 text-left">
                {modifiedData?.UA_reputation_score}
              </div>
            </div>
            <div className="row w-100 text-right">
              <div
                className="col-md-2 text-bold text-lg"
                style={{ color: "rgb(194, 65, 12)" }}
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <div className="col-md-10 text-left">
                {modifiedData?.UA_email_address}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div
            className="card p-4 text-black d-flex flex-column align-items-center justify-content-start text-center"
            style={{
              height: "85vh",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
              overflowY: "scroll",
            }}
          >
            <div className="row w-100 mb-3">
              <div className="col-md-6">
                <h5 className="text-bold w-100 h-100 text-left d-flex justify-content-start align-items-center mb-0">
                  Edit Profile
                </h5>
              </div>
              <div className="col-md-6 d-flex justify-content-end">
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
                  className={`btn btm-sm btn-muted bg-orange ml-2 ${
                    !hasChanges ? "disabled" : ""
                  }`}
                  onClick={handleNewDataSubmission}
                  disabled={!hasChanges}
                >
                  <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
            <div className="row w-100">
              <span className="text-muted text-sm text-bold">ACCOUNT NAME</span>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>Has Suffix?</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-start align-items-center mb-0">
                <input
                  type="checkbox"
                  id="hasSuffix"
                  checked={hasSuffix}
                  onChange={(e) => {
                    setHasSuffix(e.target.checked);
                    setModifiedData((prev) => ({
                      ...prev,
                      UA_suffix: e.target.checked
                        ? prev.UA_suffix && prev.UA_suffix !== ""
                          ? prev.UA_suffix
                          : " "
                        : "",
                    }));
                  }}
                  style={{ width: "1.2em", height: "1.2em" }}
                />
                <label htmlFor="hasSuffix" className="ml-2 mb-0 text-sm">
                  Yes
                </label>
              </div>
            </div>
            {hasSuffix && (
              <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
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
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            <div className="my-2" />
            <div className="row w-100">
              <span className="text-muted text-sm text-bold">
                CONTACT INFORMATION
              </span>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
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
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>Phone Number</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-center mb-0">
                <input
                  type="tel"
                  className="form-control w-100 custom-input text-sm text-white"
                  id="inputPhoneNumber"
                  placeholder="Phone number..."
                  onChange={handleChange}
                  value={modifiedData.UA_phone_number || ""}
                />
              </div>
            </div>
            <div className="my-2" />
            <div className="row w-100">
              <span className="text-muted text-sm text-bold">
                ADDITIONAL INFORMATION
              </span>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>Role</div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-start align-items-center mb-0">
                {renderRoleBadge(sessionData?.UA_user_role)}
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-1">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>
                  <span>Reputation Score</span>
                  <p className="text-xs text-muted">
                    Reputation score is a repsentation of how much the system
                    trusts you and your reporting, and serves as credentials in
                    analysis and validation of reports.
                  </p>
                </div>
              </div>
              <div className="col-md-6 form-group d-flex justify-content-center align-items-start mb-0">
                <span className="text-left w-100 text-sm mb-2 mt-1">
                  {userSessionData?.UA_reputation_score}
                </span>
              </div>
            </div>
            <div className="my-2" />
            <div className="row w-100">
              <span className="text-muted text-sm text-bold">
                IDENTITY VALIDATION
              </span>
            </div>
            <div className="row w-100 text-left pb-0 mb-0 text-sm mt-1">
              <p>
                Submit a picture of your valid ID to add validation within the
                system that you are a legitimate user.
              </p>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>Front ID Picture</div>
              </div>
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
                  onChange={(e) => handleFileChange(e, "UA_id_picture_front")}
                />
                <span className="text-green-500 w-100 text-xs ml-2 pl-2">
                  Uploaded:{" "}
                  {modifiedData?.UA_id_picture_front ? "<file name>" : "none!"}
                </span>
              </div>
            </div>
            <div className="row w-100 d-flex justify-content-center align-items-center text-left py-0 mt-2">
              <div className="col-md-6">
                <div style={{ height: "100%" }}>Back ID Picture</div>
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
                  onChange={(e) => handleFileChange(e, "UA_id_picture_back")}
                />
                <span className="text-green-500 w-100 text-xs ml-2 pl-2">
                  Uploaded:{" "}
                  {modifiedData?.UA_id_picture_back ? "<file name>" : "none!"}
                </span>
              </div>
            </div>
            <div className="my-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
