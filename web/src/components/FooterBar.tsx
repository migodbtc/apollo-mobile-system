import React from "react";

const FooterBar = () => {
  return (
    <footer className="footer py-3 px-2">
      <div className="container-fluid my-5">
        <div className="row">
          {/* Left Section - Copyright */}
          <div className="col-md-4 text-left text-md-start">
            <span className="text-muted text-sm">
              © {new Date().getFullYear()}
              <a
                href="#"
                className="text-decoration-none ps-1 ml-2"
                style={{ color: "#c2410c" }}
              >
                Apollo Development Team
              </a>
              . All rights reserved.
            </span>
          </div>

          {/* Center Section - Links */}
          <div className="col-md-4 text-center" style={{ color: "#c2410c" }}>
            <ul className="list-inline mb-0">
              {["Terms", "Privacy", "Contact"].map((item, index) => (
                <React.Fragment key={item}>
                  {index > 0 && <li className="list-inline-item px-2">·</li>}
                  <li className="list-inline-item">
                    <a href="#" className="text-decoration-none text-white">
                      {item}
                    </a>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          </div>

          {/* Right Section - Social Icons */}
          <div className="col-md-4 text-right text-md-end">
            <div className="btn-group" role="group">
              <a href="#" className="btn btn-sm btn-outline-secondary">
                DBTC
              </a>
              <a href="#" className="btn btn-sm btn-outline-secondary">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterBar;
