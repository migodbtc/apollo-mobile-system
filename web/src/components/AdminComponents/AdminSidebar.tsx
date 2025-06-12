import {
  faBullhorn,
  faClipboardList,
  faImagePortrait,
  faMapLocation,
  faTachometer,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="col-md-3 col-lg-2">
      <div
        className="sidebar"
        style={{ height: "100%", backgroundColor: "transparent" }}
      >
        <nav className="mt-2">
          <ul
            className="nav nav-pills nav-sidebar flex-column text-md"
            data-widget="treeview"
            role="menu"
            style={{ color: "rgb(100, 106, 133)" }}
          >
            <li className="nav-header text-bold">PERSONAL</li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => handleTabChange("profile")}
              >
                <p>
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Profile
                </p>
              </a>
            </li>
            <li className="nav-header text-bold">VISUALIZATION</li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
                onClick={() => handleTabChange("dashboard")}
              >
                <p>
                  <FontAwesomeIcon icon={faTachometer} className="mr-2" />
                  Dashboard
                </p>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "reportsMap" ? "active" : ""
                }`}
                onClick={() => handleTabChange("reportsMap")}
              >
                <p>
                  <FontAwesomeIcon icon={faMapLocation} className="mr-2" />
                  Reports Map
                </p>
              </a>
            </li>
            <li className="nav-header text-bold">TABLES</li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                onClick={() => handleTabChange("users")}
              >
                <p>
                  <FontAwesomeIcon icon={faUsers} className="mr-2" />
                  Users
                </p>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "reports" ? "active" : ""
                }`}
                onClick={() => handleTabChange("reports")}
              >
                <p>
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                  Reports
                </p>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "mediaStorage" ? "active" : ""
                }`}
                onClick={() => handleTabChange("mediaStorage")}
              >
                <p>
                  <FontAwesomeIcon icon={faImagePortrait} className="mr-2" />
                  Media Storage
                </p>
              </a>
            </li>
            <li className="nav-item">
              <a
                href="#"
                className={`nav-link ${
                  activeTab === "responseLogs" ? "active" : ""
                }`}
                onClick={() => handleTabChange("responseLogs")}
              >
                <p>
                  <FontAwesomeIcon icon={faBullhorn} className="mr-2" />
                  Response Logs
                </p>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
