import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import axios from "../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const SettingsScreen = () => {
  const [profile, setProfile] = useState({ name: "", email: "", tel: "" });
  const navigation = useNavigation();

  // ================= FETCH PROFILE BY USER ID =================
  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); 
      console.log("eeee");
      
      const response = await axios.get(`/user/getUserById/${userId}`);
      setProfile(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile.");
      console.error("Error fetching profile:", error);
    }
  };

  // ================= TOKEN CHECK ================= 

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  // ================= LOGOUT =================
  const logOut = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    Alert.alert("Déconnecté", "Vous avez été déconnecté.", [
      {
        text: "OK",
        onPress: () => {
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { profile });
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Paramètres</Text>
        <Text style={styles.subheading}>
          Modifier votre compte et vos paramètres de sécurité.
        </Text>

        <View style={styles.section}>
          {/* <Text style={styles.profileText}>Prénom & Nom: {profile.name}</Text>
          <Text style={styles.profileText}>Tél.: {profile.tel}</Text> */}
          <Text style={styles.profileText}>Email: {profile.email}</Text>

          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity style={styles.customButton} onPress={handleEditProfile}>
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity> */}

            <View style={styles.buttonSpacing} />

            <TouchableOpacity style={styles.customButton} onPress={logOut}>
              <Text style={styles.buttonText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.3,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: "#4caf50",
    borderRadius: 8,
  },
  subheading: {
    fontSize: 18,
    marginVertical: 10,
    color: "#4caf50",
    textAlign: "center",
  },
  section: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(255,111,32,0.6)",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#fff",
  },
  buttonContainer: {
    marginTop: 15,
    borderRadius: 8,
  },
  customButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSpacing: {
    height: 15,
  },
});

export default SettingsScreen;
