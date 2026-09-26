import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Pressable,
} from "react-native";
import axios from "../axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

const Login = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log("Logging in with:", email);

      const response = await axios.post("/auth/login", {
        email: email,
        password: password,
      });
      console.log(response.data);

      const token = response.data.access_token;
      const userId = response.data.id;
      const roles = response.data.roles; // e.g. ["3"]
      const staffMember = response.data.user?.staffMember;

      if (!token) {
        Alert.alert("Login Failed", "No token received.");
        return;
      }

      // Role check (optional)
      const role = Array.isArray(roles) ? roles[0] : roles;
      // if (role !== "3") {
      //   Alert.alert("Accès refusé", "Tu ne peux pas accéder.");
      //   return;
      // }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", String(userId));
      if (staffMember !== undefined && staffMember !== null) {
        await AsyncStorage.setItem(
          "staffMember",
          typeof staffMember === "string"
            ? staffMember
            : JSON.stringify(staffMember),
        );
      }

      navigation.navigate("Dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Invalid credentials.";
      Alert.alert("Login Failed", msg);
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message,
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          >
            <FontAwesome
              name={secureTextEntry ? "eye-slash" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>
            Vous n'avez pas de compte ? Inscrivez-vous ici.
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    resizeMode: "cover",
    opacity: 0.8,
  },
  overlay: {
    width: "90%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  eyeIconContainer: {
    position: "absolute",
    right: 10,
  },
  loginButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#4caf50",
    marginTop: 20,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default Login;
