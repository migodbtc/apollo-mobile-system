import { useState } from "react";
import { useSession } from "../constants/context/SessionContext";
import AdminSidebar from "./AdminComponents/AdminSidebar";
import AdminLoginPage from "./AdminComponents/AdminLoginPage";
import DashboardPage from "./AdminComponents/DashboardPage";
import MapVisualPage from "./AdminComponents/MapVisualPage";
import AdminProfilePage from "./AdminComponents/AdminProfilePage";
import UserCrudPage from "./AdminComponents/UserCrudPage";
import ReportsCrudPage from "./AdminComponents/ReportsCrudPage";
import MediaCrudPage from "./AdminComponents/MediaCrudPage";
import AutomationPage from "./AdminComponents/AutomationPage";
import AdminDocumentationPage from "./AdminComponents/AdminDocumentationPage";
import ResponseLogsCrudPage from "./AdminComponents/ResponseLogsCrudPage";

type AdminSegmentProps = {
  setSegment?: (seg: string) => void;
};

const AdminSegment = ({ setSegment }: AdminSegmentProps) => {
  const { sessionData, setSessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const containerClass = sessionData ? "container-fluid" : "container";

  // layout sizes
  // Use a fixed pixel width to avoid expensive layout recalculation when
  // toggling. Percentages can cause large reflow cost when many children
  // depend on computed widths.
  const SIDEBAR_WIDTH_PX = 260; // px when open
  const HEADER_HEIGHT = 64; // px

  return (
    <div id="adminSegment" className={`${containerClass} px-0`}>
      {!sessionData && <AdminLoginPage />}
      {sessionData && (
        // overall horizontal split: left = sidebar (toggleable), right = header + main
        <div style={{ display: "flex", height: "100vh", width: "100%" }}>
          {/* Sidebar (left) */}
          {sidebarOpen ? (
            <div
              style={{
                width: SIDEBAR_WIDTH_PX,
                transition: "width 180ms ease",
                overflow: "hidden",
                background: "transparent",
                boxSizing: "border-box",
              }}
              aria-hidden={!sidebarOpen}
            >
              <div style={{ height: "100%" }}>
                <AdminSidebar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            </div>
          ) : null}

          {/* Right area (80% or remaining) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Header (small) */}
            <header
              style={{
                height: HEADER_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "2px solid rgb(17, 22, 43)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setSidebarOpen((s) => !s)}
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    color: "rgb(100, 106, 133)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 24,
                  }}
                >
                  {sidebarOpen ? "«" : "»"}
                </button>

                {/* Title moved to sidebar to save header space */}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Back to Public button */}
                <button
                  onClick={() => setSegment && setSegment("public")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#646A85",
                    cursor: "pointer",
                    padding: "6px 10px",
                    borderRadius: 6,
                  }}
                >
                  Back to Public
                </button>

                {/* Logout button */}
                {sessionData && (
                  <button
                    onClick={() => {
                      alert("Account bound to session has been logged out.");
                      setSessionData(null);
                    }}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "transparent",
                      color: "#646A85",
                      cursor: "pointer",
                      padding: "6px 10px",
                      borderRadius: 6,
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            </header>

            {/* Divider below header to visually match sidebar */}
            <div
              style={{
                height: 1,
                background: "rgba(17,22,43,0.06)",
                margin: 0,
              }}
            />

            {/* Main content area */}
            <main style={{ flex: 1, overflow: "auto" }}>
              {activeTab === "dashboard" && (
                <DashboardPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "profile" && <AdminProfilePage />}
              {activeTab === "reportsMap" && (
                <MapVisualPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "users" && <UserCrudPage />}
              {activeTab === "reports" && <ReportsCrudPage />}
              {activeTab === "mediaStorage" && <MediaCrudPage />}
              {activeTab === "responseLogs" && <ResponseLogsCrudPage />}
              {activeTab === "machineLearning" && <AutomationPage />}
              {activeTab === "documentation" && <AdminDocumentationPage />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSegment;
