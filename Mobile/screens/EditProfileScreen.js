import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "../axios";
import { useNavigation, useRoute } from "@react-navigation/native";

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = route.params;

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [tel, setTel] = useState(profile.tel);

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put("/user/profile", {
        name,
        email,
        tel,
      });

      Alert.alert("Success", "Your profile has been updated.");
      navigation.navigate("Settings");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Telephone"
        value={tel}
        onChangeText={setTel}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfile;
