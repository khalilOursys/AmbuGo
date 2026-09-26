import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "../axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ScreenContrat  = () => {
  const [contrats, setContrats] = useState([]);
  const [selectedContrat, setSelectedContrat] = useState(null);
  const navigation = useNavigation();

  // ================= FETCH ALL CONTRATS =================
  const fetchContrats = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Erreur", "Utilisateur non trouvé");
        navigation.navigate("Login");
        return;
      }

      const response = await axios.get(`/contrat/byUser/${userId}`);
      setContrats(response.data);

    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les contrats.");
      console.error("Error fetching contrats:", error);
    }
  };

  // ================= FETCH DETAILS =================
  const fetchContratDetails = async (id) => {
    try {
      const res = await axios.get(`/contrat/getContratWithLigneContrat/${id}`);
      setSelectedContrat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const showAll = () => setSelectedContrat(null);

  // ================= REFRESH ON SCREEN FOCUS =================
  useFocusEffect(
    React.useCallback(() => {
      fetchContrats();
    }, [])
  );

  return (
    <ImageBackground
      source={require("../assets/background.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Liste des Contrats</Text>

        {/* ================= SELECTED CONTRAT (DETAILS) ================= */}
        {selectedContrat ? (
          <View style={styles.petItem}>
            <View style={styles.petInfo}>
              <Text style={styles.petText}>Code: {selectedContrat.code}</Text>
              <Text style={styles.petText}>Montant: {selectedContrat.montantTotal}</Text>
              <Text style={styles.petText}>Statut: {selectedContrat.statut}</Text>

              <Text style={[styles.petText, { marginTop: 10, fontWeight: "bold" }]}>
                Lignes Contrat:
              </Text>

              {selectedContrat.ligneContratList?.map((line) => (
                <Text key={line.id} style={styles.petText}>
                  • Tâche: {line.codeTache} | Qté: {line.quantite} | Prix: {line.prix}
                </Text>
              ))}

              {/* ONLY RETURN BUTTON */}
              <TouchableOpacity onPress={showAll} style={styles.button}>
                <FontAwesome name="list" size={16} color="#fff" />
                <Text style={styles.buttonText}>Retour liste</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= LIST CONTRATS ================= */
          <FlatList
            data={contrats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                /* onPress={() => fetchContratDetails(item.id)} */
                style={styles.petItem}
              >
                <View style={styles.petInfo}>
                  <Text style={styles.petText}>Code: {item.code}</Text>
                  <Text style={styles.petText}>Montant: {item.montantTotal}</Text>
                  <Text style={styles.petText}>Statut: {item.date}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default ScreenContrat ;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  backgroundImage: {
    opacity: 0.2,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  petItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  petInfo: {
    marginLeft: 10,
  },
  petText: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    marginTop: 15,
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
  },
});