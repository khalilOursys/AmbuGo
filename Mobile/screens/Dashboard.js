import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  ImageBackground,
  Image,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import HomeScreen from "./HomeScreen";
import MapScreen from "./MapScreen";
import VehiclesScreen from "./VehiclesScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        {/* Header - same as your original */}
        <View style={styles.header}>
          <Text style={styles.dashboardText}>MediDispatch</Text>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
        </View>

        {/* Content with Tabs */}
        <View style={styles.content}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                let iconName = "home";

                if (route.name === "Home") iconName = "home";
                else if (route.name === "Map") iconName = "map-marked-alt";
                else if (route.name === "Vehicles") iconName = "ambulance";
                else if (route.name === "Profile") iconName = "user";

                return (
                  <FontAwesome5 name={iconName} size={size - 2} color={color} />
                );
              },
              tabBarActiveTintColor: "#1e88e5",
              tabBarInactiveTintColor: "gray",
              tabBarStyle: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderTopWidth: 1,
                borderTopColor: "#ccc",
                height: 60,
                paddingBottom: 6,
                paddingTop: 4,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Vehicles" component={VehiclesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "flex-start",
  },
  backgroundImage: {
    resizeMode: "cover",
    alignSelf: "flex-end",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  dashboardText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopWidth: 2,
    borderTopColor: "#ccc",
  },
});

export default Dashboard;
