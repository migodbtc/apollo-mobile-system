import {
  faHomeAlt,
  faInfoCircle,
  faMap,
  faMobileAndroidAlt,
  faPhoneAlt,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "../constants/context/SessionContext";

interface NavigationBarProps {
  segment: string;
  setSegment: (segment: string) => void;
}

const NavigationBar = ({ segment, setSegment }: NavigationBarProps) => {
  const { sessionData, setSessionData } = useSession();

  const handleSegmentChange = (newSegment: string) => {
    setSegment(newSegment);
  };

  const handleLogout = () => {
    alert("Account bound to session has been logged out.");
    setSessionData(null);
  };

  return (
    <nav
      className="navbar navbar-expand-md navbar-primary navbar-dark py-3 navbarApollo w-100"
      style={{
        minHeight: 64,
        backgroundColor: "rgba(2, 6, 23, 0)",
        userSelect: "none",
      }}
    >
      <button
        className="navbar-toggler border-0"
        type="button"
        data-toggle="collapse"
        data-target="#apolloNavbar"
        aria-controls="apolloNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>{" "}
      <div className="collapse navbar-collapse" id="apolloNavbar">
        {segment == "public" ? (
          <ul className="navbar-nav">
            <li
              className="nav-item mr-3 navbarApolloItem"
              style={{ borderBottom: "3px solid #11162B" }}
            >
              <a
                className="nav-link"
                style={{ color: "#c2410c" }}
                href="#missionSection"
              >
                <FontAwesomeIcon
                  icon={faHomeAlt}
                  className="mr-2"
                  style={{ color: "#c2410c" }}
                />
                Mission
              </a>
            </li>
            <li
              className="nav-item mr-3"
              style={{ borderBottom: "3px solid #11162B" }}
            >
              <a
                className="nav-link"
                style={{ color: "#c2410c" }}
                href="#featuresSection"
              >
                <FontAwesomeIcon
                  icon={faMobileAndroidAlt}
                  className="mr-2"
                  style={{ color: "#c2410c" }}
                />
                Features
              </a>
            </li>
            <li
              className="nav-item mr-3"
              style={{ borderBottom: "3px solid #11162B" }}
            >
              <a
                className="nav-link"
                style={{ color: "#c2410c" }}
                href="#mapPreview"
              >
                <FontAwesomeIcon
                  icon={faMap}
                  className="mr-2"
                  style={{ color: "#c2410c" }}
                />
                Map
              </a>
            </li>
            <li
              className="nav-item mr-3"
              style={{ borderBottom: "3px solid #11162B" }}
            >
              <a
                className="nav-link"
                style={{ color: "#c2410c" }}
                href="#aboutSection"
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="mr-2"
                  style={{ color: "#c2410c" }}
                />
                About
              </a>
            </li>
            <li
              className="nav-item mr-3"
              style={{ borderBottom: "3px solid #11162B" }}
            >
              <a
                className="nav-link"
                style={{ color: "#c2410c" }}
                href="#contactSection"
              >
                <FontAwesomeIcon
                  icon={faPhoneAlt}
                  className="mr-2"
                  style={{ color: "#c2410c" }}
                />
                Contact
              </a>
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav">
            <li
              className="nav-item d-flex justify-content-center align-items-center mr-3 navbarApolloItem brand-text text-lg"
              style={{ color: "#646A85" }}
            >
              <b className="mr-2" style={{ color: "#c2410c" }}>
                Apollo
              </b>
              Admin
            </li>
          </ul>
        )}
        {segment == "public" ? (
          <ul className="navbar-nav ml-auto">
            <li
              className="nav-item nav-link"
              style={{
                borderBottom: "3px solid #11162B",
                color: "#646A85",
                cursor: "pointer",
              }}
              onClick={() => handleSegmentChange("admin")}
            >
              Admin Login
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav ml-auto">
            <li
              className="nav-item nav-link mr-2"
              style={{
                color: "#646A85",
                cursor: "pointer",
              }}
              onClick={() => handleSegmentChange("public")}
            >
              Back to Public
            </li>
            {sessionData && (
              <li
                className="nav-item nav-link"
                style={{
                  color: "#646A85",
                  cursor: "pointer",
                }}
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
