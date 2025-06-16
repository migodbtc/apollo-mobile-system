import LoginForm from "./LoginForm";
import AdminMockup from "../../assets/admindisplay.png";

const AdminLoginPage = () => {
  return (
    <div id="adminLoginPage" className="row" style={{ height: "90vh" }}>
      <div className="col-md-8 d-flex justify-content-center align-items-center">
        <div style={{ width: "80%", aspectRatio: 1, borderRadius: "1rem" }}>
          <div className="image-wrapper d-flex justify-content-center align-items-center">
            <img
              src={AdminMockup}
              alt="Admin Mockup"
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
      <div className="col-md-4 h-100 d-flex flex-column justify-content-center align-items-center text-center">
        <h3
          className="brand-text font-weight-bold"
          style={{ color: "#c2410c" }}
        >
          Welcome!
        </h3>
        <p className="text-white">Login to Dashboard</p>
        <LoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
