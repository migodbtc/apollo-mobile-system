import SERVER_LINK from "@/constants/netvar";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";

type MetaStats = {
  uptime: string;
  last_restart: string;
  flask_version: string;
  database_status: string;
  api_status: string;
  memory_usage: string;
  cpu_usage: string;
};

const { width, height } = Dimensions.get("screen");

const MetaPanel = () => {
  const [meta, setMeta] = useState<MetaStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => {
    setLoading(true);
    fetch(`${SERVER_LINK}/meta/get`)
      .then((res) => res.json())
      .then((data) => {
        setMeta(data);
        setLoading(false);
      })
      .catch(() => {
        setMeta({
          uptime: "--",
          last_restart: "--",
          flask_version: "--",
          database_status: "--",
          api_status: "--",
          memory_usage: "--",
          cpu_usage: "--",
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetchMeta = () => {
      setLoading(true);
      fetch(`${SERVER_LINK}/meta/get`)
        .then((res) => res.json())
        .then((data) => {
          setMeta(data);
          setLoading(false);
        })
        .catch(() => {
          setMeta({
            uptime: "--",
            last_restart: "--",
            flask_version: "--",
            database_status: "--",
            api_status: "--",
            memory_usage: "--",
            cpu_usage: "--",
          });
          setLoading(false);
        });
    };

    fetchMeta();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { width: "100%", height: "100%", backgroundColor: "#020617" },
        ]}
      >
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ color: "#f97316", marginTop: 12 }}>
          Loading server statistics...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Text style={styles.title}>
          <FontAwesome name="server" color="#f97316" size={width * 0.058} />
          {"  "}API Server Meta Statistics
        </Text>
      </View>
      <Text style={styles.description}>
        This panel displays relevant statistics about the API server used for
        Apollo. Information indicated here can be used to check and monitor the
        health of the server.
      </Text>
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <FontAwesome name="refresh" size={width * 0.045} color="#f97316" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.lastUpdated}>Last updated: {meta?.last_restart}</Text>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome name="clock-o" color="#C2410C" size={width * 0.045} />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>API Uptime</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.uptime}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome name="refresh" color="#C2410C" size={width * 0.045} />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>Last Restart</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.last_restart}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome name="code" color="#C2410C" size={width * 0.045} />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>Flask Version</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.flask_version}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome name="database" color="#C2410C" size={width * 0.045} />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>Database Status</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.database_status}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome
              name="heartbeat"
              color="#C2410C"
              size={width * 0.045}
            />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>API Status</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.api_status}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome
              name="microchip"
              color="#C2410C"
              size={width * 0.045}
            />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>Memory Usage</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.memory_usage}</Text>
      </View>
      <View style={styles.metaBox}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconBox}>
            <FontAwesome
              name="tachometer"
              color="#C2410C"
              size={width * 0.045}
            />
          </View>
          <View style={styles.labelTextBox}>
            <Text style={styles.labelText}>CPU Usage</Text>
          </View>
        </View>
        <Text style={styles.value}>{meta?.cpu_usage}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: width * 0.05,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: "bold",
    color: "#f97316",
    textAlign: "left",
  },
  description: {
    color: "#94a3b8",
    fontSize: width * 0.035,
    marginBottom: 18,
    marginLeft: 2,
  },
  metaBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
  },
  labelIconBox: {
    width: "20%",
    justifyContent: "center",
  },
  labelTextBox: {
    width: "80%",
    justifyContent: "center",
  },
  labelText: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: width * 0.035,
  },
  value: {
    width: "50%",
    color: "#E2E8F0",
    fontSize: width * 0.035,
  },
  lastUpdated: {
    fontStyle: "italic",
    color: "#94a3b8",
    fontSize: width * 0.029,
    marginBottom: 12,
    marginLeft: 2,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  refreshText: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: width * 0.032,
    marginLeft: 6,
  },
});

export default MetaPanel;
