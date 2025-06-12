import LoginForm from "./LoginForm";

const AdminLoginPage = () => {
  return (
    <div id="adminLoginPage" className="row" style={{ height: "90vh" }}>
      <div className="col-md-8"></div>
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
