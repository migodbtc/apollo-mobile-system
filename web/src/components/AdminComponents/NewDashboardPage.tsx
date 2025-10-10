import React, { Suspense, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faUsers,
  faMapLocation,
} from "@fortawesome/free-solid-svg-icons";

// lightweight dashboard: no heavy lazy widgets required for the compact layout
import SmallCard from "./SmallCard";

interface NewDashboardPageProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const NewDashboardPage = ({ setActiveTab }: NewDashboardPageProps) => {
  const [
    ,/*selectionOne*/
    /*setSelectionOne*/
  ] = useState<number>(1);

  return (
    <div
      className="container pt-3"
      style={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Suspense fallback={<div>Loading dashboard...</div>}>
        {/* Top row: 3 compact summary cards */}
        <div className="row">
          <div className="col-md-4">
            <SmallCard
              minHeight={140}
              footer={
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    className="btn btn-sm text-white"
                    style={{
                      backgroundColor: "rgb(249, 115, 22)",
                      border: "none",
                      borderRadius: 8,
                      minWidth: 140,
                    }}
                    onClick={() => setActiveTab("reports")}
                  >
                    <FontAwesomeIcon icon={faTable} /> Open reports
                  </button>
                </div>
              }
            >
              <div style={{ textAlign: "center", color: "#E6EEF8" }}>
                Reports
              </div>
            </SmallCard>
          </div>

          <div className="col-md-4">
            <SmallCard
              minHeight={140}
              footer={
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    className="btn btn-sm text-white"
                    style={{
                      backgroundColor: "rgb(249, 115, 22)",
                      border: "none",
                      borderRadius: 8,
                      minWidth: 140,
                    }}
                    onClick={() => setActiveTab("reports")}
                  >
                    View trends
                  </button>
                </div>
              }
            >
              <div style={{ textAlign: "center", color: "#E6EEF8" }}>
                Frequency
              </div>
            </SmallCard>
          </div>

          <div className="col-md-4">
            <SmallCard
              minHeight={140}
              footer={
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    className="btn btn-sm text-white"
                    style={{
                      backgroundColor: "rgb(249, 115, 22)",
                      border: "none",
                      borderRadius: 8,
                      minWidth: 140,
                    }}
                    onClick={() => setActiveTab("users")}
                  >
                    <FontAwesomeIcon icon={faUsers} /> Open users
                  </button>
                </div>
              }
            >
              <div style={{ textAlign: "center", color: "#E6EEF8" }}>Users</div>
            </SmallCard>
          </div>
        </div>

        {/* Second row: main content - recent reports + personnel */}
        <div style={{ flex: 1 }}>
          <div className="row">
            <div className="col-md-8">
              <div
                className="card p-4"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <button
                    className="btn btn-sm text-white w-100"
                    style={{
                      backgroundColor: "rgb(249, 115, 22)",
                      border: "none",
                      borderRadius: 8,
                      maxWidth: 280,
                    }}
                    onClick={() => setActiveTab("reports")}
                  >
                    <FontAwesomeIcon icon={faTable} /> Open reports
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div
                className="card p-4"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <button
                    className="btn btn-sm text-white w-100"
                    style={{
                      backgroundColor: "rgb(249, 115, 22)",
                      border: "none",
                      borderRadius: 8,
                      maxWidth: 220,
                    }}
                    onClick={() => setActiveTab("users")}
                  >
                    <FontAwesomeIcon icon={faUsers} /> Open users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default NewDashboardPage;
