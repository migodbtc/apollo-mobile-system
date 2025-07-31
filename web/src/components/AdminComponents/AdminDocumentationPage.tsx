// Custom scrollbar styles for the tab bar
const tabBarScrollbarStyle = `
  .admin-tab-bar::-webkit-scrollbar {
    height: 8px;
    background: #11162B;
  }
  .admin-tab-bar::-webkit-scrollbar-thumb {
    background: #11162B;
    border-radius: 4px;
  }
  .admin-tab-bar::-webkit-scrollbar-track {
    background: #11162B;
  }
`;

import {
  faInfo,
  faMobileAlt,
  faGlobe,
  faServer,
  faDatabase,
  faBook,
  faEllipsisH,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const TABS = [
  { name: "Introduction", icon: faBook, key: "Introduction" },
  { name: "System Overview", icon: faInfo, key: "SystemOverview" },
  { name: "Mobile Application", icon: faMobileAlt, key: "MobileApplication" },
  { name: "Web Application", icon: faGlobe, key: "WebApplication" },
  { name: "API Server", icon: faServer, key: "APIServer" },
  { name: "Relational Database", icon: faDatabase, key: "RelationalDatabase" },
  { name: "Github Repository", icon: faCodeBranch, key: "GithubRepository" },
  { name: "Miscellaneous", icon: faEllipsisH, key: "Miscellaneous" },
];

const AdminDocumentationPage = () => {
  const [activeTab, setActiveTab] = useState("Introduction");

  return (
    <div
      className="container-fluid"
      style={{ height: "90vh", overflowY: "scroll" }}
    >
      <div className="row" style={{ height: "85vh" }}>
        <div className="col-md-12 py-2 h-100">
          <div
            className="d-flex flex-row justify-content-start align-items-left"
            style={{ color: "#c2410c" }}
          >
            <h5 className="box-title">Admin Documentation</h5>
          </div>
          <style>{tabBarScrollbarStyle}</style>
          <div
            className="card text-black mb-0 admin-tab-bar"
            style={{
              height: 64,
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              backgroundColor: "#0A0D1D",
              overflowX: "auto",
              display: "flex",
              flexDirection: "row",
              whiteSpace: "nowrap",
            }}
          >
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className="p-2 d-flex justify-content-center align-items-center"
                style={{
                  minWidth: 120,
                  height: "100%",
                  backgroundColor:
                    activeTab === tab.key ? "#11162B" : "#0A0D1D",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                  color: "white",
                  userSelect: "none",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.key ? "bold" : "normal",
                  transition: "background 0.2s, color 0.2s",
                  overflow: "hidden",
                  flex: "0 0 auto",
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                <span
                  className="mx-3"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  <FontAwesomeIcon icon={tab.icon} />
                  {"  "}
                  {tab.name}
                </span>
              </div>
            ))}
          </div>
          <div
            className="card p-4 text-black overflow-y-scroll"
            style={{
              height: "85%",
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentationPage;
