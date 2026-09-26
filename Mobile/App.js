import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Dashboard from "./screens/Dashboard"; // Adjust the import paths as needed
import Login from "./screens/Login";
import Register from "./screens/Register";
import { name as appName } from "./app.json";
import { AppRegistry } from "react-native";
import EditProfile from "./screens/EditProfileScreen";

const Stack = createStackNavigator();
AppRegistry.registerComponent(appName, () => App);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token"); // Change 'token' to your actual key
      if (token) {
        setIsLoggedIn(true); // Token exists, user is logged in
      }
      setLoading(false); // Set loading to false after checking
    };

    checkToken();
  }, []);

  if (loading) {
    // Show loader while checking token
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Dashboard" : "Login"}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
