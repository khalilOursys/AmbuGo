import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import Configuration from "./configuration";

const instance = axios.create({
  baseURL: Configuration.BACK_BASEURL,
});

console.log("API base URL:", Configuration.BACK_BASEURL);

// Attach JWT token to each request
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Helpful logging on errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("AXIOS ERROR:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default instance;
