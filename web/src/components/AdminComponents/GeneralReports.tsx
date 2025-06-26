import { faFire, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

interface GeneralReportsProps {
  selectionOne: number;
  activeTab: string;
  setSelectionOne: React.Dispatch<React.SetStateAction<number>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const GeneralReports = ({
  selectionOne,
  setSelectionOne,
  setActiveTab,
}: GeneralReportsProps) => {
  const { combinedReports } = useAdminSQL();

  const selectionOneStringMap: { [key: number]: string } = {
    1: "today",
    2: "this past week",
    3: "this past month",
    4: "since start of records",
  };

  // SIMPLIFIED FILTERING - NO MEMO
  const getFilteredReports = () => {
    if (!combinedReports?.length) return [];
    if (selectionOne === 4) return combinedReports;

    const now = Date.now();
    const cutoffDays = [1, 7, 30][selectionOne - 1] || 0;
    return combinedReports.filter(([pre]) => {
      const reportTime = new Date(pre.PR_timestamp).getTime();
      return (now - reportTime) / 86400000 < cutoffDays;
    });
  };

  const filteredReports = getFilteredReports();

  // SIMPLIFIED METRICS - NO MEMO
  const getMetrics = () => {
    const imageSubmissions = filteredReports.filter(
      ([pre]) => pre.PR_image !== undefined && pre.PR_image !== null
    ).length;

    const videoSubmissions = filteredReports.filter(
      ([pre]) => pre.PR_video !== undefined && pre.PR_video !== null
    ).length;

    const pendingReports = filteredReports.filter(
      ([pre]) => pre.PR_report_status === "pending"
    ).length;

    const usersReported = new Set(
      filteredReports.map(([pre]) => pre.PR_user_id)
    ).size;

    return {
      imageSubmissions,
      videoSubmissions,
      pendingReports,
      usersReported,
    };
  };

  const { imageSubmissions, videoSubmissions, pendingReports, usersReported } =
    getMetrics();

  // DEBOUNCED HANDLER
  const handleSelectionOneChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const val = parseInt(event.target.value, 10);
    requestAnimationFrame(() => {
      setSelectionOne(val);
    });
  };

  return (
    <>
      <div
        className="d-flex flex-row justify-content-between align-items-center"
        style={{ height: "15%", color: "#c2410c" }}
      >
        <div>
          <h5 className="box-title">Reports</h5>
        </div>
        <div className="form-group">
          <select
            className="form-control form-control-md text-sm text-white px-2"
            style={{
              backgroundColor: "#11162B",
              border: "none",
              borderRadius: "1rem",
            }}
            onChange={handleSelectionOneChange}
            value={selectionOne}
          >
            <option value="1">Today</option>
            <option value="2">Past Week</option>
            <option value="3">Past Month</option>
            <option value="4">All-Time</option>
          </select>
        </div>
      </div>
      <div
        className="card p-4 text-black"
        style={{
          height: "85%",
          borderRadius: "1rem",
          backgroundColor: "#11162B",
        }}
      >
        <div className="row h-100">
          <div className="col-md-6 d-flex flex-column text-align-center justify-content-center pr-3">
            <span className="text-muted text-sm mb-1">
              Reports {selectionOneStringMap[selectionOne]}
            </span>
            <h1 style={{ color: "#c2410c" }}>
              <FontAwesomeIcon icon={faFire} />
              {"  "}
              {filteredReports.length}
            </h1>
            <p className="mt-1">
              The system has received {filteredReports.length} report
              submissions.{" "}
            </p>
            <a
              className="btn btn-sm mt-3 text-white w-100"
              onClick={() => setActiveTab("reports")}
              style={{
                borderColor: "rgb(194, 65, 12)",
                backgroundColor: "rgb(249, 115, 22)",
                borderRadius: "1rem",
              }}
            >
              <FontAwesomeIcon icon={faTable} />
              {"  "}
              View all reports
            </a>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-left pl-3">
            <span className="text-muted text-sm text-bold">
              REPORT IMAGE SUBMISSIONS
            </span>
            <h3 className="mb-3">{imageSubmissions}</h3>
            <span className="text-muted text-sm text-bold">
              REPORT VIDEO SUBMISSIONS
            </span>
            <h3 className="mb-3">{videoSubmissions}</h3>
            <span className="text-muted text-sm text-bold">
              PENDING REPORT VALIDATIONS
            </span>
            <h3 className="mb-3">{pendingReports}</h3>
            <span className="text-muted text-sm text-bold">
              NO. OF USERS REPORTED
            </span>
            <h3 className="mb-3">{usersReported}</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralReports;
