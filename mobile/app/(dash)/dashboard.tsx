import AboutPanel from "@/components/panels/AboutPanel";
import HomePanel from "@/components/panels/HomePanel";
import MapsPanel from "@/components/panels/MapsPanel";
import NavigationBar from "@/components/dash/NavigationBar";
import PageHeader from "@/components/dash/PageHeader";
import ReportsPanel from "@/components/panels/ReportsPanel";
import { useSession } from "@/constants/contexts/SessionContext";
import { JSX, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import HistoryPanel from "@/components/panels/HistoryPanel";
import TeamsPanel from "@/components/panels/TeamsPanel";
import DatabasePanel from "@/components/panels/DatabasePanel";

const { width, height } = Dimensions.get("window");

export default function Dashboard() {
  const { sessionData, setSessionData } = useSession();
  const [selectedPanel, setSelectedPanel] = useState<string>("home");

  // DECIDE WHICH PANEL TO DISPLAY DEPENDING ON SELECTED PANEL
  // d ko alam bakit naka caps yan sorry
  const panels: Record<string, JSX.Element> = {
    home: <HomePanel />,
    map: <MapsPanel />,
    about: <AboutPanel />,
    reports: <ReportsPanel />,
    history: <HistoryPanel />,
    team: <TeamsPanel />,
    database: <DatabasePanel />,
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {sessionData && (
        <PageHeader
          selectedPanel={selectedPanel}
          setSelectedPanel={setSelectedPanel}
        />
      )}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        {panels[selectedPanel] || null}
      </View>
      <NavigationBar
        selectedPanel={selectedPanel}
        setSelectedPanel={setSelectedPanel}
      />
    </View>
  );
}
