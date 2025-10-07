// Custom scrollbar styles for the tab bar
const tabBarScrollbarStyle = `
  .admin-tab-bar::-webkit-scrollbar {
    height: 8px;
    background: #11162B;
  }
  .admin-tab-bar::-webkit-scrollbar-thumb {
    background: #11162B;
    border-radius: 4px;
  }
  .admin-tab-bar::-webkit-scrollbar-track {
    background: #11162B;
  }
`;

import {
  faInfo,
  faMobileAlt,
  faGlobe,
  faServer,
  faDatabase,
  faBook,
  faEllipsisH,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const TABS = [
  { name: "Introduction", icon: faBook, key: "Introduction" },
  { name: "System Overview", icon: faInfo, key: "SystemOverview" },
  { name: "Mobile Application", icon: faMobileAlt, key: "MobileApplication" },
  { name: "Web Application", icon: faGlobe, key: "WebApplication" },
  { name: "API Server", icon: faServer, key: "APIServer" },
  { name: "Relational Database", icon: faDatabase, key: "RelationalDatabase" },
  { name: "Github Repository", icon: faCodeBranch, key: "GithubRepository" },
  { name: "Miscellaneous", icon: faEllipsisH, key: "Miscellaneous" },
];

const AdminDocumentationPage = () => {
  const [activeTab, setActiveTab] = useState("Introduction");

  return (
    <div className="container pt-3" style={{ minHeight: "90vh" }}>
      <div className="row w-100">
        <div className="col-md-12 py-2">
          <div
            className="d-flex flex-row justify-content-start align-items-left"
            style={{ color: "#c2410c" }}
          >
            <h5 className="box-title">Admin Documentation</h5>
          </div>
          <style>{tabBarScrollbarStyle}</style>
          <div
            className="card text-white mb-0 admin-tab-bar"
            style={{
              height: 64,
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
              backgroundColor: "#0A0D1D",
              overflowX: "auto",
              display: "flex",
              flexDirection: "row",
              whiteSpace: "nowrap",
            }}
          >
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className="p-2 d-flex justify-content-center align-items-center"
                style={{
                  minWidth: 120,
                  height: "100%",
                  backgroundColor:
                    activeTab === tab.key ? "#11162B" : "#0A0D1D",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                  color: "white",
                  userSelect: "none",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.key ? "bold" : "normal",
                  transition: "background 0.2s, color 0.2s",
                  overflow: "hidden",
                  flex: "0 0 auto",
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                <span
                  className="mx-3"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  <FontAwesomeIcon icon={tab.icon} />
                  {"  "}
                  {tab.name}
                </span>
              </div>
            ))}
          </div>
          <div
            className="card p-4 text-white"
            style={{
              borderBottomLeftRadius: "1rem",
              borderBottomRightRadius: "1rem",
              backgroundColor: "#11162B",
              border: "1px solid rgba(255,255,255,0.04)",
              boxShadow: "0 6px 18px rgba(2,6,23,0.6)",
            }}
          >
            {/** Render content based on active tab */}
            <div style={{ color: "#E6EEF8", lineHeight: 1.6 }}>
              {renderTabContent(activeTab)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function renderTabContent(key: string) {
  function getIconForKey(k: string) {
    const t = TABS.find((x) => x.key === k);
    return t ? t.icon : faBook;
  }

  switch (key) {
    case "Introduction":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Introduction
          </h4>
          <p>
            Apollo is a mobile-first incident reporting platform. Field users
            create reports (image or video) from the mobile app; the server
            stores raw media, runs ML verification in the background, and the
            web dashboard allows admins to review, edit, and manage reports.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Purpose of this doc</h5>
          <ul>
            <li>Capture the system architecture for new contributors.</li>
            <li>Document developer workflows and local run steps.</li>
            <li>
              List conventions for API payloads, DB schema, and background jobs.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>High-level components</h5>
          <ul>
            <li>
              Mobile app (Expo / React Native) — user-facing reporting client.
            </li>
            <li>
              API Server (Flask) — accepts uploads, stores media, exposes admin
              APIs.
            </li>
            <li>
              Background verifier (Hermes model) — asynchronous ML verification.
            </li>
            <li>
              Web dashboard (React + Vite) — administrative interface and
              reporting tools.
            </li>
          </ul>
        </div>
      );

    case "SystemOverview":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            System Overview
          </h4>
          <p>
            The system is intentionally separated into user-facing clients and a
            server-side processing pipeline to keep uploads fast and defer
            heavier verification work to the backend.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Detailed data flow</h5>
          <ol>
            <li>
              Mobile client prepares a JSON <code>report</code> payload and
              sends it as multipart/form-data together with one file field (
              <code>image</code> or <code>video</code>).
            </li>
            <li>
              API server stores the raw file bytes into MySQL table
              <code>media_storage</code> and inserts a record into
              <code>preverified_reports</code> with metadata and a reference to
              the media blob.
            </li>
            <li>
              Background verifier (separate thread started by the Flask server)
              loads the Hermes TF model and processes new items from
              <code>preverified_reports</code>, writing results to
              <code>postverified_reports</code> and updating the preverified row
              with status / timestamps.
            </li>
            <li>
              Admin UI and mobile clients observe the changes. The admin
              dashboard uses merging logic available in
              <code>AdminSQLContext.combineReports()</code> to present a
              CombinedReport view (pre + post data).
            </li>
          </ol>

          <h5 style={{ color: "#BEE7FF" }}>Failure modes & idempotency</h5>
          <ul>
            <li>
              File storage: uploads must be saved first, then DB rows created to
              avoid orphaned metadata if the server crashes mid-request.
            </li>
            <li>
              Verifier should be idempotent: reprocessing the same preverified
              row should not duplicate results in
              <code>postverified_reports</code>.
            </li>
            <li>
              Clients should handle in-progress states (e.g., show 'verifying')
              until postverified results are available.
            </li>
          </ul>
        </div>
      );

    case "MobileApplication":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Mobile Application
          </h4>
          <p>
            The mobile client is an Expo-managed React Native app focused on
            quick report submission and background upload resilience.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Key files</h5>
          <ul>
            <li>
              <code>mobile/app/_layout.tsx</code> — app shell and server-sent
              events (SSE) registration that shows notifications via Expo.
            </li>
            <li>
              <code>mobile/constants/netvar.ts</code> — central place to read
              the server base URL. Keep this in sync with
              <code>app.json</code> for Expo builds.
            </li>
            <li>
              <code>mobile/constants/contexts/AdminSQLContext.tsx</code> —
              implements fetchX() helpers and <code>combineReports()</code> to
              merge pre/post verified rows for UI consumption.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Local development</h5>
          <ol>
            <li>
              Install dependencies: <code>npm install</code> in{" "}
              <code>mobile/</code>.
            </li>
            <li>
              Start Expo: <code>npx expo start</code> and follow QR code
              instructions.
            </li>
            <li>
              To point to a local server, set{" "}
              <code>expo.extra.SERVER_LINK</code> in <code>app.json</code>.
            </li>
          </ol>

          <h5 style={{ color: "rgb(159,164,188)" }}>
            Network & payload conventions
          </h5>
          <ul>
            <li>
              Upload endpoints accept multipart/form-data with a string field
              named <code>report</code> containing JSON (metadata) and a single
              file field named <code>image</code> or <code>video</code>.
            </li>
            <li>
              Keep uploads resilient: retry on transient failures and only
              mutate local state once the server returns success.
            </li>
          </ul>

          <h5 style={{ color: "#BEE7FF" }}>Common issues</h5>
          <ul>
            <li>
              Permission errors on Android/iOS — ensure runtime camera and
              storage permissions are requested before capture.
            </li>
            <li>
              CORS or host mismatch in Expo — confirm <code>SERVER_LINK</code>
              is reachable from the device/emulator and uses the correct
              protocol and port.
            </li>
          </ul>
        </div>
      );

    case "WebApplication":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Web Application
          </h4>
          <p>
            The admin dashboard is a React app bootstrapped with Vite. Styles
            are mostly in <code>web/src</code> and global CSS in
            <code>web/src/App.css</code>.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Key locations</h5>
          <ul>
            <li>
              <code>web/src/main.tsx</code> — app bootstrap and providers.
            </li>
            <li>
              <code>web/src/components</code> — UI components and pages.
            </li>
            <li>
              <code>web/package.json</code> — scripts and dependencies.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Local development</h5>
          <p>
            Common commands (run from <code>web/</code>):
          </p>
          <pre style={{ background: "#0B1220", padding: 12, color: "#CFE8FF" }}>
            npm install npm run dev
          </pre>

          <h5 style={{ color: "rgb(159,164,188)" }}>Building for production</h5>
          <p>
            Use <code>npm run build</code> to create an optimized bundle under
            <code>web/dist</code> (or <code>web/build</code> depending on the
            script). Verify static assets are copied and the app can reach the
            API server via the configured environment variable or runtime
            config.
          </p>

          <h5 style={{ color: "#BEE7FF" }}>Troubleshooting</h5>
          <ul>
            <li>
              If components fail to load, check the console for missing modules
              or incorrect import paths (case-sensitivity can fail on some CI
              systems).
            </li>
            <li>
              If the dashboard cannot call APIs, confirm the browser can reach
              the server URL and that CORS is configured on the Flask server.
            </li>
          </ul>
        </div>
      );

    case "APIServer":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            API Server
          </h4>
          <p>
            The Flask server exposes endpoints used by both mobile and web
            clients and runs a background verifier thread. The server uses a
            direct MySQL connection and raw SQL strings in many handlers.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Important files</h5>
          <ul>
            <li>
              <code>server/main.py</code> — route definitions and the
              <code>start_background_verification</code> thread.
            </li>
            <li>
              <code>server/app.py</code> — Flask app factory and MySQL init.
            </li>
            <li>
              <code>server/config.py</code> — database credentials and
              environment flags.
            </li>
            <li>
              <code>server/requirements.txt</code> — Python dependencies.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>API contract notes</h5>
          <p>Examples and conventions:</p>
          <ul>
            <li>
              Many endpoints use POST even for reads/queries. Example: to read a
              single user send <code>{'{"UA_user_id": 123}'}</code> as JSON to{" "}
              <code>/user/get/one</code>.
            </li>
            <li>
              Uploads: multipart/form-data where <code>report</code> is a JSON
              string and one file field is present. Example (conceptual):
              <pre
                style={{ background: "#07111A", padding: 8, color: "#CFE8FF" }}
              >
                Content-Disposition: form-data; name="report"
                {'{"description":"...", "UA_user_id":1}'}
              </pre>
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Running locally</h5>
          <ol>
            <li>
              Create a Python virtualenv in <code>server/</code>.
            </li>
            <li>
              Install dependencies: <code>pip install -r requirements.txt</code>
              .
            </li>
            <li>
              Set DB creds in <code>server/config.py</code> or env vars and run
              <code>python main.py</code>.
            </li>
          </ol>

          <h5 style={{ color: "rgb(159,164,188)" }}>Troubleshooting</h5>
          <ul>
            <li>
              MySQL connection errors — ensure database exists and credentials
              in <code>server/config.py</code> are correct.
            </li>
            <li>
              Background thread crashes — check model path under
              <code>server/model/models/deployed/</code> and inspect server logs
              for stack traces.
            </li>
            <li>
              If uploads fail, confirm Flask has adequate request size limits
              and that the client sends exactly one file field.
            </li>
          </ul>
        </div>
      );

    case "RelationalDatabase":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Relational Database
          </h4>
          <p>
            The project uses MySQL to persist users, reports, and media blobs.
            Binary media is saved to <code>media_storage</code> as BLOBs while
            report metadata is split between <code>preverified_reports</code>
            and <code>postverified_reports</code>.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Schema & SQL</h5>
          <ul>
            <li>
              Base schema: <code>sql/apollo_db_v1.0.3.sql</code>.
            </li>
            <li>
              When adding or renaming columns, update all raw SQL strings in
              <code>server/main.py</code> to keep queries in sync.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Best practices</h5>
          <ul>
            <li>
              Favor transactions for multi-step writes (store blob, then insert
              metadata).
            </li>
            <li>
              Use consistent naming for columns (e.g., prefix user columns with{" "}
              <code>UA_</code> as used in existing handlers).
            </li>
            <li>
              Keep long-running read queries paginated to avoid blocking the
              server under load.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Migration checklist</h5>
          <ol>
            <li>
              Add migration SQL file under <code>sql/</code> with a clear
              filename describing the version.
            </li>
            <li>
              Update any code that uses raw SQL strings to reference the new
              columns/tables.
            </li>
            <li>
              Test against a seeded development DB before applying to
              production.
            </li>
          </ol>
        </div>
      );

    case "GithubRepository":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Github Repository
          </h4>
          <p>
            The repository groups concerns into three top-level folders:
            <code>mobile/</code>, <code>server/</code>, and <code>web/</code>.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Contribution workflow</h5>
          <ul>
            <li>
              Create feature branches named like <code>feat/</code> or
              <code>fix/</code> with a short description.
            </li>
            <li>
              Open PRs to <code>main</code> with a clear description of what
              changed and any DB or API impact.
            </li>
            <li>
              When a PR changes API shapes, list the affected endpoints and
              update both mobile and web callers in the PR or in follow-up
              branches.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>PR checklist</h5>
          <ul>
            <li>Run linting and unit tests (where available).</li>
            <li>
              Document schema changes and add SQL migrations to{" "}
              <code>sql/</code>.
            </li>
            <li>
              Manually smoke-test critical flows: upload, verify, and merge
              views on web and mobile.
            </li>
          </ul>
        </div>
      );

    case "Miscellaneous":
      return (
        <div>
          <h4
            style={{
              color: "rgb(100,106,133)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon
              icon={getIconForKey(key)}
              style={{ marginRight: 10 }}
            />
            Miscellaneous
          </h4>
          <p>Helpful operational notes and small implementation details.</p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Background verifier</h5>
          <ul>
            <li>
              Model artifacts live under{" "}
              <code>server/model/models/deployed/</code>.
            </li>
            <li>
              The verifier runs as a daemon thread started by the Flask process
              (see <code>start_background_verification</code> in
              <code>server/main.py</code>); the thread periodically scans
              <code>preverified_reports</code> for unprocessed items.
            </li>
            <li>
              To debug the verifier, run the model inference code in an isolated
              script and add logging around model load and pre/post-processing
              stages.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Notifications</h5>
          <ul>
            <li>
              Mobile subscribes to server-sent events at
              <code>/notifications/stream</code>. The SSE endpoint forwards
              verification updates so clients can display real-time status.
            </li>
            <li>
              If notifications don't arrive, check the server logs and ensure
              the connection is not blocked by proxies or load balancers.
            </li>
          </ul>

          <h5 style={{ color: "rgb(159,164,188)" }}>Frontend merging notes</h5>
          <p>
            Use <code>AdminSQLContext.combineReports()</code> to merge
            <code>preverifiedReports</code> and <code>postverifiedReports</code>
            into a CombinedReport list used throughout the admin UI. This
            preserves the original submission metadata while augmenting it with
            verification results.
          </p>

          <h5 style={{ color: "rgb(159,164,188)" }}>Quick links</h5>
          <ul>
            <li>
              <code>mobile/app/_layout.tsx</code> — SSE + notifications
            </li>
            <li>
              <code>server/main.py</code> — routes & verifier
            </li>
            <li>
              <code>sql/apollo_db_v1.0.3.sql</code> — DB schema
            </li>
          </ul>
        </div>
      );

    default:
      return (
        <div>
          <h4 style={{ color: "#FFD580" }}>Documentation</h4>
          <p>Select a tab to view documentation.</p>
        </div>
      );
  }
}

export default AdminDocumentationPage;
