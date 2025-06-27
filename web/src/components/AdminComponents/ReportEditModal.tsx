import { useState } from "react";
import type {
  CombinedReport,
  PreverifiedReport,
} from "../../constants/types/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faFloppyDisk,
  faRightFromBracket,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

interface ReportEditModalProps {
  showSelectedModal: boolean;
  selectedRow: CombinedReport | null;
  setSelectedRow: React.Dispatch<React.SetStateAction<CombinedReport | null>>;
  handleExitClick: () => void;
}

const ReportEditModal = ({
  showSelectedModal,
  selectedRow,
  setSelectedRow,
  handleExitClick,
}: ReportEditModalProps) => {
  const [modifiedData, setModifiedData] = useState<CombinedReport | null>(
    selectedRow
  );
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!modifiedData) return;
    const { id, value } = e.target;
    console.log(id, value);
    // const keyMap: Record<string, keyof PreverifiedReport> = {
    //   inputFirstName: "UA_first_name",
    //   inputMiddleName: "UA_middle_name",
    //   inputLastName: "UA_last_name",
    //   inputSuffix: "UA_suffix",
    //   inputEmailAddress: "UA_email_address",
    //   inputPhoneNumber: "UA_phone_number",
    //   inputReputationScore: "UA_reputation_score",
    //   userRole: "UA_user_role",
    // };
    // const userKey = keyMap[id];
    // if (!userKey) return;
    // setModifiedData((prev) =>
    //   prev
    //     ? {
    //         ...prev,
    //         [userKey]:
    //           userKey === "UA_reputation_score" ? Number(value) : value,
    //       }
    //     : prev
    // );
  };

  //   const handleComparison = () => {
  //     if (!selectedRow || !modifiedData) {
  //       setHasChanges(false);
  //       return;
  //     }
  //     const safeCompare = (a: any, b: any) => (a || "") === (b || "");
  //     const changed =
  //       !safeCompare(selectedRow.UA_first_name, modifiedData.UA_first_name) ||
  //       !safeCompare(selectedRow.UA_middle_name, modifiedData.UA_middle_name) ||
  //       !safeCompare(selectedRow.UA_last_name, modifiedData.UA_last_name) ||
  //       !safeCompare(selectedRow.UA_suffix, modifiedData.UA_suffix) ||
  //       !safeCompare(
  //         selectedRow.UA_email_address,
  //         modifiedData.UA_email_address
  //       ) ||
  //       !safeCompare(selectedRow.UA_phone_number, modifiedData.UA_phone_number) ||
  //       !safeCompare(selectedRow.UA_user_role, modifiedData.UA_user_role) ||
  //       Number(selectedRow.UA_reputation_score) !==
  //         Number(modifiedData.UA_reputation_score);
  //     setHasChanges(changed);
  //   };

  const handleReset = () => {
    setModifiedData(selectedRow);
  };

  const handleNewDataSubmission = () => {
    // Submit logic here
  };

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
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                Report ID {modifiedData[0]?.PR_report_id}
              </h5>
              <span className="text-muted text-sm text-bold mt-2">
                INFORMATION
              </span>
              <p className="text-sm">
                Contains all the information about the report registered within
                the system. Depending on whether the report has been validated
                or not, the information within this modal is subject to change.
              </p>
              <div className="row w-100 px-2">
                <span className="text-muted text-sm text-bold">
                  ACCOUNT NAME
                </span>
              </div>
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
              >
                <FontAwesomeIcon icon={faFloppyDisk} className="mr-2" />
                Save
              </button>
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

export default ReportEditModal;
