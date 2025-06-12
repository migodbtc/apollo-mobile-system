import {
  faComputer,
  faFireExtinguisher,
  faUserGraduate,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AboutSection = () => {
  return (
    <section id="aboutSection">
      <div className="row" style={{ height: "10vh" }} />
      <div className="row" style={{ height: "80vh" }}>
        <div className="col-md-4 d-flex flex-column justify-content-center align-items-left">
          <span className="text-muted text-sm">
            Additional details about the project
          </span>
          <h2 className="text-bold" style={{ color: "#c2410c" }}>
            About the Project
          </h2>
          <p>
            Get to know the history of the system, the developers behind its
            growth and change, the reason for its creation, and many more.
          </p>
        </div>
        <div className="col-md-8">
          <div className="row h-50 pb-4">
            <div className="col-md-6 px-2">
              <div
                className="card h-100 ml-4 shadow-lg"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                }}
              >
                <div className="card-body p-2 px-5 d-flex flex-column justify-content-center">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mb-4"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #c2410c",
                      backgroundColor: "#11162B",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      color="#c2410c"
                      className="fs-3"
                    />
                  </div>
                  <h5 className="font-weight-bold text-lg mt-0 pt-0">
                    Student Innovation for Community Safety
                  </h5>
                  <p className="card-text text-white text-sm">
                    Apollo is developed by a small group of college students in
                    Don Bosco Technical College, as part of a capstone project
                    development.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 px-2 ">
              <div
                className="card h-100 ml-4 shadow-lg"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                }}
              >
                <div className="card-body p-3 px-5 d-flex flex-column justify-content-center">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mb-4"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #c2410c",
                      backgroundColor: "#11162B",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFireExtinguisher}
                      color="#c2410c"
                      className="fs-3"
                    />
                  </div>
                  <h5 className="font-weight-bold text-lg mt-0 pt-0">
                    Bridging Technology and Fire Safety
                  </h5>
                  <p className="card-text text-white text-sm">
                    The project is developed with the objective of collaborating
                    with the Daang Bakal Fire Station as the project's main
                    beneficiary.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row h-50">
            <div className="col-md-6 px-2">
              <div
                className="card h-100 ml-4 shadow-lg"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                }}
              >
                <div className="card-body p-3 px-5 d-flex flex-column justify-content-center">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mb-4"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #c2410c",
                      backgroundColor: "#11162B",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faComputer}
                      color="#c2410c"
                      className="fs-3"
                    />
                  </div>
                  <h5 className="font-weight-bold text-lg mt-0 pt-0">
                    Powered By Cutting-Edge Tech
                  </h5>
                  <p className="card-text text-white text-sm">
                    Built with technologies such as React.js, Expo React Native,
                    MySQL, Flask, and a custom TensorFlow machine learning model
                    specifically developed for this system.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-6 px-2">
              <div
                className="card h-100 ml-4 shadow-lg"
                style={{
                  borderRadius: "1rem",
                  backgroundColor: "#11162B",
                }}
              >
                <div className="card-body p-3 px-5 d-flex flex-column justify-content-center">
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mb-4"
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #c2410c",
                      backgroundColor: "#11162B",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUserGraduate}
                      color="#c2410c"
                      className="fs-3"
                    />
                  </div>
                  <h5 className="font-weight-bold text-lg mt-0 pt-0">
                    Built on Industry Wisdom
                  </h5>
                  <p className="card-text text-white text-sm">
                    Developed started in January of 2025, with the assistance of
                    several professors who have used their experience in the
                    industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row" style={{ height: "10vh" }} />
    </section>
  );
};

export default AboutSection;
