import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "../axios";

const MapScreen = () => {
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState(null);
  const [region, setRegion] = useState({
    latitude: 36.8065,
    longitude: 10.1815,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    fetchActiveMission();
  }, []);

  const fetchActiveMission = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/missions/active");
      const data = response.data;

      if (data) {
        setMission(data);
        if (data.latitude && data.longitude) {
          setRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          {mission && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {mission.status?.replace("_", " ")}
              </Text>
            </View>
          )}
        </View>

        <MapView style={styles.map} region={region} showsUserLocation>
          {mission?.latitude && mission?.longitude && (
            <Marker
              coordinate={{
                latitude: mission.latitude,
                longitude: mission.longitude,
              }}
              title="Patient"
            >
              <FontAwesome5 name="map-marker-alt" size={32} color="#e53935" />
            </Marker>
          )}

          {mission && (
            <Marker
              coordinate={{
                latitude: region.latitude + 0.01,
                longitude: region.longitude - 0.01,
              }}
              title="Ambulance"
            >
              <FontAwesome5 name="ambulance" size={28} color="#1e88e5" />
            </Marker>
          )}
        </MapView>

        {mission && (
          <View style={styles.bottomCard}>
            <Text style={styles.missionCode}>{mission.code}</Text>
            <Text style={styles.patientName}>
              {mission.patient
                ? `${mission.patient.firstname} ${mission.patient.lastname}`
                : "Unknown Patient"}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <FontAwesome5 name="clock" size={16} color="#1e88e5" />
                <Text style={styles.infoLabel}>ETA</Text>
                <Text style={styles.infoValue}>8 min</Text>
              </View>
              <View style={styles.infoItem}>
                <FontAwesome5 name="road" size={16} color="#1e88e5" />
                <Text style={styles.infoLabel}>Distance</Text>
                <Text style={styles.infoValue}>3.2 km</Text>
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <FontAwesome5 name="ambulance" size={16} color="#666" />
              <Text style={styles.vehicleText}>
                {mission.assignments?.[0]?.vehicle?.registration || "N/A"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fa" },
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1a237e" },
  statusBadge: {
    backgroundColor: "#e53935",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  map: { flex: 1 },
  bottomCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
  },
  missionCode: { fontSize: 16, fontWeight: "700", color: "#1a237e" },
  patientName: { fontSize: 15, color: "#333", marginTop: 4, marginBottom: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  infoItem: { alignItems: "center" },
  infoLabel: { fontSize: 12, color: "#888", marginTop: 4 },
  infoValue: { fontSize: 16, fontWeight: "700", color: "#1a237e" },
  vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  vehicleText: { fontSize: 14, color: "#555" },
});

export default MapScreen;
