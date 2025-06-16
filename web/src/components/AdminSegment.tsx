import { useState } from "react";
import { useSession } from "../constants/context/SessionContext";
import AdminSidebar from "./AdminComponents/AdminSidebar";
import AdminLoginPage from "./AdminComponents/AdminLoginPage";
import DashboardPage from "./AdminComponents/DashboardPage";
import MapVisualPage from "./AdminComponents/MapVisualPage";

const AdminSegment = () => {
  const { sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const containerClass = sessionData ? "container-fluid" : "container";

  return (
    <div id="adminSegment" className={containerClass}>
      {/* Render the login page if there is no session logged in */}
      {!sessionData && <AdminLoginPage />}

      {/* Render the admin dashboard if an admin is logged in.  */}
      {sessionData && (
        <div className="row" style={{ height: "90vh" }}>
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="col-md-9 col-lg-10">
            <div style={{ height: "100%", paddingBottom: 0, marginBottom: 0 }}>
              {activeTab === "dashboard" && (
                <DashboardPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "profile" && <div>Profile Content</div>}
              {activeTab === "reportsMap" && (
                <MapVisualPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "users" && <div>Users Management</div>}
              {activeTab === "reports" && <div>Reports List</div>}
              {activeTab === "responseLogs" && <div>Media Storage</div>}
              {activeTab === "mediaStorage" && <div>Response Logs</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSegment;
