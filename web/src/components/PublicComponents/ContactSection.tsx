import {
  faExternalLink,
  faMailForward,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ContactSection = () => {
  return (
    <section id="contactSection">
      <div className="row" style={{ height: "10vh" }} />
      <div className="row" style={{ height: "80vh" }}>
        <div className="col-md-6 h-100">
          <div
            className="card h-100 px-4 d-flex flex-column justify-content-center align-items-left shadow-lg"
            style={{ borderRadius: "1rem", backgroundColor: "#11162B" }}
          >
            <form action="">
              <div className="card-body text-sm">
                <h2>Message Us With Our Web Form!</h2>
                <p className="text-md">
                  Fill out the form below to send us a message directly to our
                  email address.
                </p>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control-sm w-100 custom-input text-sm"
                    id="inputFullName"
                    placeholder="Full name"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control-sm w-100 custom-input text-sm"
                    id="inputEmailAddress"
                    placeholder="Email address"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control-sm w-100 custom-input text-sm"
                    id="inputSubject"
                    placeholder="Subject"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control-sm w-100 custom-input text-sm"
                    id="inputMessage"
                    placeholder="Message"
                  />
                </div>
                <a
                  href="#"
                  className="btn btn-lg mt-2 text-white"
                  style={{
                    borderColor: "#c2410c",
                    backgroundColor: "#F97316",
                    borderRadius: "1rem",
                  }}
                >
                  <FontAwesomeIcon icon={faMailForward} className="mr-2" />
                  Send a message!
                </a>
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-6 pl-4 d-flex flex-column justify-content-center align-items-left">
          <span className="text-muted fst-italic">Contact section</span>
          <h1 className="text-bold" style={{ color: "#c2410c" }}>
            Get in touch with the Apollo team!
          </h1>
          <p>
            Have questions, suggestions, or feedback but don't know how to get
            in touch? Reach out to us using the details below — we’d love to
            hear from you.
          </p>
          <table className="table table-borderless mt-3">
            <thead>
              <tr>
                <th className="mb-0 pb-0" style={{ color: "#c2410c" }}>
                  Email Address
                </th>
                <th className="mb-0 pb-0" style={{ color: "#c2410c" }}>
                  Contact Number
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>apollo@domain.com</td>
                <td>+1 (555) 123-4567</td>
              </tr>
              <tr>
                <th className="mb-0 pb-0" style={{ color: "#c2410c" }}>
                  Location
                </th>
                <th className="mb-0 pb-0" style={{ color: "#c2410c" }}>
                  Social Network
                </th>
              </tr>
              <tr>
                <td>123 Apollo St., Tech City</td>
                <td>
                  <a
                    href="https://facebook.com/apollo"
                    target="_blank"
                    rel="noreferrer"
                    className="me-2 text-white"
                  >
                    <FontAwesomeIcon icon={faExternalLink} /> Facebook
                  </a>
                  <br />
                  <a
                    href="https://twitter.com/apollo"
                    target="_blank"
                    rel="noreferrer"
                    className="me-2 text-white"
                  >
                    <FontAwesomeIcon icon={faExternalLink} /> Twitter
                  </a>
                  <br />
                  <a
                    href="https://instagram.com/apollo"
                    target="_blank"
                    rel="noreferrer"
                    className="me-2 text-white"
                  >
                    <FontAwesomeIcon icon={faExternalLink} /> Instagram
                  </a>
                  <br />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="row" style={{ height: "10vh" }} />
    </section>
  );
};

export default ContactSection;
