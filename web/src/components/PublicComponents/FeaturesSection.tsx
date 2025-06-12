import {
  faMap,
  faMobileAndroidAlt,
  faNoteSticky,
  faPhoneAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import apolloMockup2 from "../../assets/apollomockup2.png";

const FeaturesSection = () => {
  return (
    <section id="featuresSection">
      <div className="row" style={{ height: "100vh" }}>
        <div className="col-md-6 h-100">
          <div className="image-wrapper d-flex justify-content-center align-items-center">
            <img
              src={apolloMockup2}
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
        <div className="col-md-6 h-100 d-flex flex-column justify-content-center align-items-left">
          <h1 className="font-weight-bold" style={{ color: "#c2410c" }}>
            Features
          </h1>
          <p className="text-muted">
            Apollo is designed and developed to be reliable and accessible for
            both civilians and responders. Some of its features include but are
            not limited to:
          </p>
          <ul className="list-unstyled">
            <li className="mb-3">
              <FontAwesomeIcon
                icon={faMobileAndroidAlt}
                className="mr-2"
                style={{ color: "#c2410c" }}
              />
              Automated & easy to navigate fire reporting
            </li>
            <li className="mb-3">
              <FontAwesomeIcon
                icon={faMap}
                className="mr-2"
                style={{ color: "#c2410c" }}
              />
              Quick and efficient report map visualization
            </li>
            <li className="mb-3">
              <FontAwesomeIcon
                icon={faPhoneAlt}
                className="mr-2"
                style={{ color: "#c2410c" }}
              />
              Stay updated with real-time updates and notifications.
            </li>
            <li className="mb-3">
              <FontAwesomeIcon
                icon={faNoteSticky}
                className="mr-2"
                style={{ color: "#c2410c" }}
              />
              Easily track and manage reports over time.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
