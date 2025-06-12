import { faMobileAndroid, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apolloMockup from "../../assets/apollomockup.png";

const HeroSection = () => {
  return (
    <section id="heroSection" className="content-header m-0 p-0">
      <div className="row" style={{ height: "90vh" }}>
        <div
          className="col-md-6 d-flex flex-column justify-content-center"
          style={{ color: "#c2410c" }}
        >
          <h1
            className="display-4 font-weight-bold"
            style={{ fontSize: "3.5rem" }}
          >
            Apollo Mobile App
          </h1>
          <p className="lead mb-0" style={{ color: "white" }}>
            Making fire report and emergency response safer, faster and more
            reliable.
          </p>
          <div className="d-flex gap-3 mt-4 mb-3">
            <a
              href="#"
              className="btn btn-lg btn-dark mr-2"
              style={{ backgroundColor: "#000" }}
            >
              <FontAwesomeIcon icon={faMobileAndroid} className="mr-1" /> Google
              Play Store
            </a>
            <a
              href="#"
              className="btn btn-lg btn-primary"
              style={{
                borderColor: "#c2410c",
                backgroundColor: "#F97316",
              }}
            >
              <FontAwesomeIcon icon={faThumbsUp} className="mr-2" />
              Facebook Page
            </a>
          </div>

          <span className="text-muted">
            Scroll down to see more information.
          </span>
        </div>
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div className="image-wrapper d-flex justify-content-center align-items-center">
            <img
              src={apolloMockup}
              alt="Apollo Mockup"
              className="img-fluid"
              style={{
                objectFit: "contain",
                pointerEvents: "none",
                userSelect: "none",
                touchAction: "none",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
