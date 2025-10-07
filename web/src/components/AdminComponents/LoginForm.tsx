import { faSignIn } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useSession } from "../../constants/context/SessionContext";
import { SERVER_LINK } from "../../constants/netvar";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

type LoginFormProps = {
  setSegment?: (seg: string) => void;
};

const LoginForm = ({ setSegment }: LoginFormProps) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememebrMe] = useState<boolean>(false);
  const { setSessionData } = useSession();
  const { refreshAll } = useAdminSQL();

  const handleLogin = async (e?: React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!username || !password) {
      alert("Please fill in the login details before submitting!");
      return 0;
    }

    const payload = {
      UA_username: username,
      UA_password: password,
      UA_remember_me: rememberMe,
    };

    try {
      const response = await fetch(`${SERVER_LINK}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      const role = data["user_data"]["UA_user_role"];
      console.log(role);

      if (role == "superadmin" || role == "admin") {
        console.log("Valid user!");
      } else {
        alert(
          `Sorry! Only administrators and superadministrators can access this!`
        );
        return;
      }

      if (response.ok) {
        const {
          UA_user_id,
          UA_username,
          UA_user_role,
          UA_created_at,
          UA_last_name,
          UA_first_name,
          UA_middle_name,
          UA_suffix,
          UA_email_address,
          UA_phone_number,
          UA_reputation_score,
          UA_id_picture_front,
          UA_id_picture_back,
        } = data.user_data;

        alert(`Login successful! Welcome, @${UA_username}!`);

        setSessionData({
          UA_user_id,
          UA_username,
          UA_user_role,
          UA_created_at,
          UA_last_name,
          UA_first_name,
          UA_middle_name,
          UA_suffix,
          UA_email_address,
          UA_phone_number,
          UA_reputation_score,
          UA_id_picture_front,
          UA_id_picture_back,
        });
        await refreshAll();
      } else {
        alert("Authentication failed. Please try again!");
      }
    } catch (e) {
      console.error(e);
      alert("Server connection error during login authentication!");
    }
  };

  return (
    <form action="">
      <div className="form-group mb-3">
        <input
          type="text"
          className="custom-input-login rounded-lg px-3 py-2 text-md w-full"
          style={{ width: "100%" }}
          id="inputUsername"
          placeholder="Username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </div>
      <div className="form-group d-flex flex-column justify-content-center align-items-left">
        <input
          type="password"
          className="custom-input-login rounded-lg px-3 py-2 text-md w-full"
          style={{ width: "100%" }}
          id="inputPassword"
          placeholder="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <div className="form-check d-flex flex-column justify-content-center align-items-left mb-2">
        <input
          type="checkbox"
          className="form-check-input custom-input-login"
          id="exampleCheck1"
        />
        <label
          className="form-check-label text-left text-sm justify-content-end pt-2"
          htmlFor="exampleCheck1"
          style={{ color: "rgb(106, 106, 133)" }}
          onClick={() => setRememebrMe(!rememberMe)}
        >
          Remember me
        </label>
      </div>

      <button
        type="button"
        className="btn btn-md mt-3 text-white rounded-xl w-100"
        style={{
          borderColor: "#c2410c",
          backgroundColor: "#F97316",
        }}
        onClick={handleLogin}
      >
        <FontAwesomeIcon icon={faSignIn} className="mr-2" />
        Login
      </button>
      <div className="form-group d-flex flex-column justify-content-center align-items-left">
        <a className="text-muted mt-2 text-left text-sm  mb-2">
          <span
            style={{
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            Recover password?
          </span>
        </a>
      </div>
      <div className="form-group d-flex flex-column justify-content-center align-items-left">
        <a
          className="text-muted mt-2 text-left text-sm mb-2"
          style={{ cursor: "pointer", width: "100%" }}
          onClick={() => {
            if (setSegment) setSegment("public");
            else window.location.href = "/";
          }}
        >
          <span
            style={{
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              style={{ fontSize: "1.15rem" }}
            />
            Return to landing page
          </span>
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
