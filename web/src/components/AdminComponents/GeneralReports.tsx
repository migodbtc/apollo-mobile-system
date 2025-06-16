import { faFire, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

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
  const selectionOneStringMap: { [key: number]: string } = {
    1: "today",
    2: "this past week",
    3: "this past month",
    4: "since start of records",
  };

  const handleSelectionOneChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // 1 signifies today, 2 signifies past week, 3 signifies past month, 4 signifies all time
    const val = event.target.value;
    console.log("selectionOne changed to value " + val);
    setSelectionOne(parseInt(val, 10));
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
            onChange={(e) => handleSelectionOneChange(e)}
          >
            <option value="1" selected>
              Today
            </option>
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
              {"  "}32
            </h1>
            <p className="mt-1">
              The system has received 32 report submissions.{" "}
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
            <h3 className="mb-3">19</h3>
            <span className="text-muted text-sm text-bold">
              REPORT VIDEO SUBMISSIONS
            </span>
            <h3 className="mb-3">13</h3>
            <span className="text-muted text-sm text-bold">
              PENDING REPORT VALIDATIONS
            </span>
            <h3 className="mb-3">8</h3>
            <span className="text-muted text-sm text-bold">
              NO. OF USERS REPORTED
            </span>
            <h3 className="mb-3">7</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default GeneralReports;
