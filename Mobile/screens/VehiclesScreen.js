import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import axios from "../axios";
import { useFocusEffect } from "@react-navigation/native";

const VehiclesScreen = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/vehicles");
      setVehicles(response.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to fetch vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles();
    }, []),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "#43a047";
      case "BUSY":
      case "ASSIGNED":
        return "#fb8c00";
      case "MAINTENANCE":
        return "#757575";
      case "OFFLINE":
        return "#e53935";
      default:
        return "#1e88e5";
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
        <Text style={styles.heading}>Vehicles</Text>

        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No vehicles found</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: getStatusColor(item.status) + "22" },
                  ]}
                >
                  <FontAwesome5
                    name="ambulance"
                    size={24}
                    color={getStatusColor(item.status)}
                  />
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.vehicleName}>
                  {item.brand || "Ambulance"} {item.model || ""}
                </Text>
                <Text style={styles.registration}>{item.registration}</Text>

                <View style={styles.badges}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "#1e88e5" }]}>
                    <Text style={styles.badgeText}>{item.level}</Text>
                  </View>
                </View>
              </View>

              {item.status === "AVAILABLE" && (
                <TouchableOpacity style={styles.assignBtn}>
                  <Text style={styles.assignBtnText}>Assign</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fa" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 16,
  },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  cardLeft: { marginRight: 14 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1 },
  vehicleName: { fontSize: 16, fontWeight: "700", color: "#222" },
  registration: { fontSize: 13, color: "#666", marginTop: 2, marginBottom: 8 },
  badges: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  assignBtn: {
    backgroundColor: "#1e88e5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});

export default VehiclesScreen;
