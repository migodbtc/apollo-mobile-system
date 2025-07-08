import {
  faToggleOn,
  faToggleOff,
  faBrain,
  faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHermes } from "../../constants/context/HermesContext";
import { SERVER_LINK } from "../../constants/netvar";

const AutomationPage = () => {
  const { toggleValidation, uptime, setToggleValidation, setUptime } =
    useHermes();

  const activeColor = "#22c55e";
  const inactiveColor = "#ef4444";

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const toggleHermesAutomation = async () => {
    try {
      const response = await fetch(`${SERVER_LINK}/verification/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toggle_state: !toggleValidation }),
      });

      if (!response.ok) {
        alert("Failed to toggle Hermes automation. Please try again later.");
        throw new Error("Failed to toggle Hermes automation");
      }

      setToggleValidation((prev) => {
        if (!prev) setUptime(0);
        return !prev;
      });
    } catch (error) {
      console.error("Error toggling Hermes automation:", error);
    }
  };

  return (
    <div
      className="container-fluid"
      style={{ height: "90vh", overflowY: "scroll" }}
    >
      <div className="row">
        <div className="col-md-4 py-2">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "15%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title">Automation Controls</h5>
            </div>
          </div>
          <div
            className="card p-4 text-black mt-1"
            style={{
              height: "85%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div className="row d-flex flex-row justify-content-center align-items-center mt-2">
              <div
                className="img-fluid img-circle d-flex flex-column justify-content-center align-items-center"
                style={{
                  width: "20vh",
                  aspectRatio: 1,
                  cursor: "pointer",
                  userSelect: "none",
                  border: `5px solid ${
                    toggleValidation ? activeColor : inactiveColor
                  }`,
                  color: toggleValidation ? activeColor : inactiveColor,
                  transition: "border-color 0.3s, color 0.3s",
                }}
                onClick={toggleHermesAutomation}
              >
                <span style={{ transition: "color 0.3s" }}>
                  <FontAwesomeIcon
                    icon={toggleValidation ? faToggleOn : faToggleOff}
                    size="2x"
                    color={toggleValidation ? activeColor : inactiveColor}
                    style={{
                      transition: "color 0.3s",
                    }}
                  />
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: toggleValidation ? activeColor : inactiveColor,
                    fontWeight: "bold",
                    transition: "color 0.3s",
                  }}
                >
                  {toggleValidation ? "ON" : "OFF"}
                </span>
              </div>
            </div>
            <span className="text-muted text-sm text-bold mt-4">
              HERMES TOGGLE
            </span>
            <p className="text-sm mb-0">
              Click the button to turn on/off the Hermes machine learning model.
            </p>
            <span className="text-muted text-sm mt-1">
              More information on the right!
            </span>
          </div>
        </div>
        <div className="col-md-8 py-2">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "15%", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title">Model Overview</h5>
            </div>
          </div>
          <div
            className="card p-4 text-black mt-1"
            style={{
              height: "85%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div className="row">
              <div className="col-md-6 d-flex flex-column align-items-left justify-content-between">
                <span className="text-muted text-sm text-bold mt-4">
                  MODEL STATUS
                </span>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: toggleValidation ? activeColor : inactiveColor,
                  }}
                >
                  {toggleValidation ? "Online" : "Offline"}
                </p>
                <span className="text-muted text-sm text-bold mt-4">
                  MODEL UPTIME
                </span>
                <p className="text-sm mb-2">
                  {toggleValidation ? formatUptime(uptime) : "--"}
                </p>
                <span className="text-muted text-sm text-bold mt-4">
                  MODEL VERSION
                </span>
                <p className="text-sm mb-2">
                  Hermes Keras Model 2025-05-30 #155556
                </p>
              </div>
              <div className="col-md-6 d-flex flex-column align-items-left justify-content-center">
                <h4 className="m-0 mb-2" style={{ color: "#c2410c" }}>
                  <FontAwesomeIcon icon={faBrain} />
                  {"  "}ABOUT HERMES
                </h4>
                <p className="text-sm mb-2">
                  Hermes is a custom machine learning model developed for the
                  needs of the Apollo System.
                </p>
                <ul className="text-sm" style={{ paddingLeft: "0" }}>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5em",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="mr-3"
                      color="#22c55e"
                    />
                    Detects whether a fire is detected with a confidence score
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5em",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="mr-3"
                      color="#22c55e"
                    />
                    Analyzes for severity level, fire type, and spread potential
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5em",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCheckSquare}
                      className="mr-3"
                      color="#22c55e"
                    />
                    Can be trained and updated with newer data from previous
                    fires whether video or image
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPage;
