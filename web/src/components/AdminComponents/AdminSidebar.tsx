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
