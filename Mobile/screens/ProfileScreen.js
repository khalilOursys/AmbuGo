import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/users/me");
      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("userId");
            await AsyncStorage.removeItem("staffMember");

            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const menuItems = [
    { icon: "calendar-alt", label: "My Schedule", color: "#1e88e5" },
    { icon: "check-circle", label: "Completed Missions", color: "#43a047" },
    { icon: "bell", label: "Notifications", color: "#fb8c00", badge: 2 },
    { icon: "cog", label: "Settings", color: "#757575" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-md" size={40} color="#1e88e5" />
          </View>
          <Text style={styles.name}>
            {user
              ? `${user.firstName || ""} ${user.lastName || ""}`
              : "Loading..."}
          </Text>
          <Text style={styles.role}>{user?.role || "STAFF"}</Text>
          <Text style={styles.company}>
            {user?.company?.name || "MediDispatch"}
          </Text>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.color + "22" },
                ]}
              >
                <FontAwesome5 name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <MaterialIcons name="chevron-right" size={22} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={16} color="#e53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f7fa" },
  scrollView: { flex: 1 },
  container: { paddingHorizontal: 16, paddingBottom: 40 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a237e",
    marginVertical: 12,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: "700", color: "#222" },
  role: { fontSize: 14, color: "#1e88e5", fontWeight: "600", marginTop: 4 },
  company: { fontSize: 13, color: "#888", marginTop: 2 },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#333" },
  badge: {
    backgroundColor: "#e53935",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: "#ffebee",
    borderRadius: 12,
  },
  logoutText: { color: "#e53935", fontWeight: "700", fontSize: 15 },
});

export default ProfileScreen;
