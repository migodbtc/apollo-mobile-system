import React from "react";
import {
  faBook,
  faBullhorn,
  faClipboardList,
  faImagePortrait,
  faMapLocation,
  faRobot,
  faTachometer,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "../../constants/context/SessionContext";

// Session info block shown under the title in the sidebar
const SessionInfo: React.FC = () => {
  const { sessionData } = useSession();

  if (!sessionData) {
    return (
      <div style={{ padding: "10px 12px", color: "#5b616e" }}>
        <div style={{ fontSize: 14 }}>Not signed in</div>
      </div>
    );
  }

  const fullName = `${sessionData.UA_first_name || ""} ${
    sessionData.UA_last_name || ""
  }`.trim();
  const initials =
    (sessionData.UA_first_name ? sessionData.UA_first_name[0] : "A") +
    (sessionData.UA_last_name ? sessionData.UA_last_name[0] : "");

  const roleColor =
    sessionData.UA_user_role &&
    sessionData.UA_user_role.toLowerCase().includes("admin")
      ? "#c2410c"
      : "#5b9cff";

  return (
    <div
      style={{
        padding: "10px 12px 14px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: "linear-gradient(135deg,#2b3242,#121419)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E6EEF8",
          fontWeight: 700,
        }}
      >
        {initials.toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          title={fullName || sessionData.UA_username}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#E6EEF8",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fullName || sessionData.UA_username}
        </div>
        <div style={{ marginTop: 4 }}>
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 10,
              background: roleColor,
              color: "#07111A",
              fontWeight: 600,
              textTransform: "capitalize",
              display: "inline-block",
            }}
          >
            {sessionData.UA_user_role || "user"}
          </span>
        </div>
      </div>
    </div>
  );
};

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tabName: string
  ) => {
    e.preventDefault();
    handleTabChange(tabName);
  };

  const sections = [
    {
      header: "PERSONAL",
      items: [{ key: "profile", label: "Profile", icon: faUser }],
    },
    {
      header: "VISUALIZATION",
      items: [
        { key: "dashboard", label: "Dashboard", icon: faTachometer },
        { key: "reportsMap", label: "Reports Map", icon: faMapLocation },
      ],
    },
    {
      header: "TABLES",
      items: [
        { key: "users", label: "Users", icon: faUsers },
        { key: "reports", label: "Reports", icon: faClipboardList },
        { key: "mediaStorage", label: "Media Storage", icon: faImagePortrait },
        { key: "responseLogs", label: "Response Logs", icon: faBullhorn },
      ],
    },
    {
      header: "MISCELLANEOUS",
      items: [
        { key: "machineLearning", label: "Automation", icon: faRobot },
        { key: "documentation", label: "Documentation", icon: faBook },
      ],
    },
  ];

  let idx = 0;

  return (
    <div>
      <div
        className="sidebar p-2"
        style={{
          height: "100vh",
          width: "100%",
          backgroundColor: "#01040F",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid rgb(17, 22, 43)",
        }}
      >
        {/* Title card moved here from header */}
        <div style={{ padding: "10px 12px 8px 12px", fontSize: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <b style={{ color: "#c2410c" }}>Apollo</b>
            <span style={{ color: "#646A85" }}>Admin</span>
          </div>
        </div>

        {/* Session account name + role badge */}
        <SessionInfo />

        {/* Divider with no margin directly below the title card */}
        <div
          style={{ height: 1, background: "rgba(17,22,43,0.06)", margin: 0 }}
        />

        <nav className="mt-2" style={{ flex: 1, overflow: "auto" }}>
          <ul
            className="nav nav-pills nav-sidebar flex-column text-md"
            data-widget="treeview"
            role="menu"
            style={{
              color: "rgb(100, 106, 133)",
              paddingLeft: 0,
              marginLeft: 0,
              margin: 0,
              listStyle: "none",
            }}
          >
            {sections.map((section) => (
              <React.Fragment key={section.header}>
                <li className="nav-header text-bold">{section.header}</li>
                {section.items.map((it) => {
                  const currentIdx = idx++;
                  return (
                    <li
                      key={it.key}
                      className="nav-item sidebar-item"
                      style={{ animationDelay: `${currentIdx * 45}ms` }}
                    >
                      <a
                        href="#"
                        className={`nav-link ${
                          activeTab === it.key ? "active" : ""
                        }`}
                        onClick={(e) => handleAnchorClick(e, it.key)}
                      >
                        <p>
                          <FontAwesomeIcon icon={it.icon} className="mr-2" />
                          {it.label}
                        </p>
                      </a>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default React.memo(AdminSidebar);
