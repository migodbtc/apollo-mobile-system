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
import NewDashboardPage from "./AdminComponents/NewDashboardPage";

const AdminSegment = () => {
  const { sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const containerClass = sessionData ? "container-fluid" : "container";

  return (
    <div id="adminSegment" className={containerClass}>
      {!sessionData && <AdminLoginPage />}

      {sessionData && (
        <div className="row" style={{ height: "90vh" }}>
          <div className="col-md-4 col-lg-3">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="col-md-8 col-lg-9">
            <div style={{ height: "100%", paddingBottom: 0, marginBottom: 0 }}>
              {activeTab === "dashboard" && (
                <NewDashboardPage
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSegment;
