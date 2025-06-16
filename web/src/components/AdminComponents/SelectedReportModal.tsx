import { faFileAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import type {
  PostverifiedReport,
  PreverifiedReport,
} from "../../constants/interfaces/interface";

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
        overflow: "auto",
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
          }}
        >
          <div className="modal-body p-4">
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
            <div className="row w-100  align-items-stretch">
              <div className="col-md-8">
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    REPORT DATA
                  </span>
                </div>
                <div className="row">
                  <div className="col-md-6">Address</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <div className="col-md-6">Coordinates</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Date & Time</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    REPORTER DATA
                  </span>
                </div>
                <div className="row">
                  <div className="col-md-6">Name</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <div className="col-md-6">Role</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Reputation</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <span className="text-muted text-sm text-bold mt-2 mx-2">
                    MEDIA DATA
                  </span>
                </div>
                <div className="row">
                  <div className="col-md-6">Media</div>
                  <div className="col-md-6">--</div>
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
                  <div className="col-md-6">--</div>
                </div>
                <div className="row">
                  <div className="col-md-6">Validated?</div>
                  <div className="col-md-6">--</div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-6">Reputation</div>
                  <div className="col-md-6">--</div>
                </div>
              </div>
              <div
                className="col-md-4 d-flex flex-column p-0"
                style={{ height: "" }}
              >
                <div
                  className="card bg-dark mb-0 flex-grow-1"
                  style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "1rem",
                    overflow: "hidden",
                  }}
                ></div>
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
