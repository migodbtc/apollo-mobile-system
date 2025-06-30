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

const AdminSegment = () => {
  const { sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const containerClass = sessionData ? "container-fluid" : "container";

  return (
    <div id="adminSegment" className={containerClass}>
      {!sessionData && <AdminLoginPage />}

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
              {activeTab === "profile" && <AdminProfilePage />}
              {activeTab === "reportsMap" && (
                <MapVisualPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "users" && <UserCrudPage />}
              {activeTab === "reports" && <ReportsCrudPage />}
              {activeTab === "responseLogs" && <div>Media Storage</div>}
              {activeTab === "mediaStorage" && <MediaCrudPage />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSegment;
