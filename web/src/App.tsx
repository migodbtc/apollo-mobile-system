import "./App.css";
import NavigationBar from "./components/NavigationBar";
import { useState } from "react";
import PublicSegment from "./components/PublicSegment";
import {
  SessionProvider,
  useSession,
} from "./constants/context/SessionContext";
import AdminSegment from "./components/AdminSegment";

function AppContent() {
  const [segment, setSegment] = useState<string>("public");
  const { sessionData } = useSession();

  // Determine layout classes based on segment and session
  const layoutClass =
    segment === "admin" && sessionData ? "layout-fixed" : "layout-top-nav";
  const containerClass =
    segment === "admin" && sessionData ? "container-fluid" : "container";

  return (
    <div className={`${layoutClass} bg-fullpagebg`}>
      <div className={containerClass}>
        {/* NAVIGATION BAR */}
        <NavigationBar segment={segment} setSegment={setSegment} />
      </div>

      {segment === "public" ? <PublicSegment /> : <AdminSegment />}
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
