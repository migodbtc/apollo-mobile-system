import {
  faBars,
  faHomeAlt,
  faInfoCircle,
  faMobileAndroidAlt,
  faPhoneAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSession } from "../constants/context/SessionContext";

interface NavigationBarProps {
  segment: string;
  setSegment: (segment: string) => void;
}

const NavigationBar = ({ segment, setSegment }: NavigationBarProps) => {
  const { sessionData } = useSession();

  const handleSegmentChange = (newSegment: string) => {
    setSegment(newSegment);
  };

  return (
    <nav
      className="navbar navbar-expand navbar-primary navbar-dark py-3 px-3 navbarApollo"
      style={{
        backgroundColor: "rgba(2, 6, 23, 0)",
        height: "10vh",
      }}
    >
      {" "}
      {segment == "public" ? (
        <ul className="navbar-nav">
          <li
            className="nav-item d-none d-sm-inline-block mr-3 navbarApolloItem"
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
            className="nav-item d-none d-sm-inline-block mr-3"
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
            className="nav-item d-none d-sm-inline-block mr-3"
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
            className="nav-item d-none d-sm-inline-block mr-3"
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
            className="nav-item d-none d-flex justify-content-center align-items-center mr-3 navbarApolloItem brand-text text-lg"
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
            className="nav-item d-none d-sm-inline-block nav-link"
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
            className="nav-item d-none d-sm-inline-block nav-link"
            style={{
              borderBottom: "3px solid #11162B",
              color: "#646A85",
              cursor: "pointer",
            }}
            onClick={() => handleSegmentChange("public")}
          >
            Back to Public
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavigationBar;
