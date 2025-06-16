import { useState } from "react";
import SubmissionDateChart from "./SubmissionDateChart";
import UserRolesDonut from "./UserRolesDonut";
import RecentReportsTable from "./RecentReportsTable";
import PersonnelPreview from "./PersonnelPreview";
import GeneralReports from "./GeneralReports";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable } from "@fortawesome/free-solid-svg-icons";

interface DashboardPageProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardPage = ({ activeTab, setActiveTab }: DashboardPageProps) => {
  const [selectionOne, setSelectionOne] = useState<number>(1);

  return (
    <div
      className="container-fluid"
      style={{ height: "90vh", overflowY: "scroll" }}
    >
      <div className="row">
        <div className="col-md-6 py-2">
          <GeneralReports
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectionOne={selectionOne}
            setSelectionOne={setSelectionOne}
          />
        </div>
        <div className="col-md-3 py-2">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "15%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title">Submission Dates</h5>
            </div>
          </div>
          <div
            className="card p-4 text-black d-flex flex-column justify-content-center align-items-left"
            style={{
              height: "85%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div style={{ height: "60%", width: "100%" }}>
              <SubmissionDateChart />
            </div>
            <span className="text-muted text-sm text-bold mt-2">
              REPORT FREQUENCY
            </span>
            <p className="text-sm">
              This chart shows the number of weekly reports submitted within the
              system.
            </p>
          </div>
        </div>
        <div className="col-md-3 py-2">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "15%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title">Users by Role</h5>
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
            <div style={{ height: "60%", width: "100%" }}>
              <UserRolesDonut />
            </div>
            <span className="text-muted text-sm text-bold pt-3">
              ROLE COUNT
            </span>
            <p className="text-sm">
              This doughnut chart illustrates the roles and the number of users
              with these roles. Hover the color to see more information!
            </p>
          </div>
        </div>
      </div>
      <div className="row mb-5">
        <div className="col-md-8">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "10%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title mt-1">Recent Reports</h5>
            </div>
          </div>
          <div
            className="card p-4 pb-5 text-black mt-1"
            style={{
              height: "85%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <span className="text-muted text-sm text-bold">
              LAST 10 REPORTS
            </span>
            <p className="text-sm">
              Below are the latest 10 reports submitted within the system. For
              full reports, visit the reports table found on the sidebar, seen
              at the left side of the screen.
            </p>

            <RecentReportsTable />
          </div>
        </div>
        <div className="col-md-4">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "10%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title mt-1">Personnel</h5>
            </div>
          </div>
          <div
            className="card p-4 text-black mt-1 pb-5"
            style={{
              height: "85%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <span className="text-muted text-sm text-bold">
              PERSONNEL PREVIEW
            </span>
            <p className="text-sm">
              These are the following administrators or superadministrators who
              have access to their own personal admin dashboards. See all in the
              users table.
            </p>
            <a
              className="btn btn-sm mt-1 mb-2 text-white w-100"
              onClick={() => setActiveTab("users")}
              style={{
                borderColor: "rgb(194, 65, 12)",
                backgroundColor: "rgb(249, 115, 22)",
                borderRadius: "1rem",
              }}
            >
              <FontAwesomeIcon icon={faTable} />
              {"  "}
              View all users
            </a>
            <PersonnelPreview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
