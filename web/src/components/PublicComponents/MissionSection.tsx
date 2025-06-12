import {
  faMap,
  faMobileAndroidAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MissionSection = () => {
  return (
    <section id="missionSection">
      <div
        className="row d-flex flex-row justify-content-center align-items-end pb-3"
        style={{ height: "20vh" }}
      >
        <h2 className="font-weight-bold" style={{ fontSize: "3rem" }}>
          What is our <span style={{ color: "#c2410c" }}>mission</span>?
        </h2>
      </div>
      <div className="row" style={{ height: "70vh" }}>
        <div
          className="col-md-4 px-3 d-flex flex-column justify-content-center"
          style={{ color: "#c2410c" }}
        >
          <div
            className="card shadow-lg"
            style={{
              height: "100%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div className="card-body p-5">
              <div className="row h-25 d-flex justify-content-center align-items-center">
                <div
                  className="rounded-circle text-xl"
                  style={{
                    height: "80%",
                    aspectRatio: "1/1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid #c2410c",
                  }}
                >
                  <FontAwesomeIcon icon={faUser} color="#c2410c" />
                </div>
              </div>
              <div className="row h-75 py-3">
                <div className="col text-left">
                  <h3 className="font-weight-bold">
                    App for Civilians & Responders
                  </h3>
                  <p className="card-text text-white text-sm">
                    Both civilians and fire emergency responders can use Apollo:
                    civilians can report imminent fires and keep track of the
                    nearest fire reports, while responders can manage and track
                    these submitted reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="col-md-4 px-3 d-flex flex-column justify-content-center"
          style={{ color: "#c2410c" }}
        >
          <div
            className="card shadow-lg"
            style={{
              height: "100%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div className="card-body p-5">
              <div className="row h-25 d-flex justify-content-center align-items-center">
                <div
                  className="rounded-circle text-xl"
                  style={{
                    height: "80%",
                    aspectRatio: "1/1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid #c2410c",
                  }}
                >
                  <FontAwesomeIcon icon={faMobileAndroidAlt} color="#c2410c" />
                </div>
              </div>
              <div className="row h-75 py-3">
                <div className="col text-left">
                  <h3 className="font-weight-bold">Make Reporting Faster</h3>
                  <p className="card-text text-white text-sm">
                    Reporting is easier as Apollo supports automated information
                    retrieval straight from your phone such as the time and the
                    exact location of the report. Less time manually inputting
                    details, less effort required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="col-md-4 px-3 d-flex flex-column justify-content-center"
          style={{ color: "#c2410c" }}
        >
          <div
            className="card shadow-lg"
            style={{
              height: "100%",
              borderRadius: "1rem",
              backgroundColor: "#11162B",
            }}
          >
            <div className="card-body p-5">
              <div className="row h-25 d-flex justify-content-center align-items-center">
                <div
                  className="rounded-circle text-xl"
                  style={{
                    height: "80%",
                    aspectRatio: "1/1",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    border: "3px solid #c2410c",
                  }}
                >
                  <FontAwesomeIcon icon={faMap} color="#c2410c" />
                </div>
              </div>
              <div className="row h-75 py-3">
                <div className="col text-left">
                  <h3 className="font-weight-bold">Easier Location Tracking</h3>
                  <p className="card-text text-white text-sm">
                    Don't know where the location of a certain address is? No
                    need to be worried, as you can view the current reports on a
                    custom-made map that easily visualizes the possibility of
                    fires within the vicinity of your area.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="row d-flex flex-row justify-content-center align-items-center"
        style={{ height: "10vh" }}
      ></div>
    </section>
  );
};

export default MissionSection;
