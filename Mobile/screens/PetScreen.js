import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ImageBackground,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import axios from "../axios";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const PetScreen = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasImagePickerPermission, setHasImagePickerPermission] =
    useState(null);
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Chat");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [poid, setPoid] = useState("");
  const [adresse, setAdresse] = useState("");
  const [qrData, setQrData] = useState("");
  const [goodWithChildren, setGoodWithChildren] = useState(false);
  const [goodWithDogs, setGoodWithDogs] = useState(false);
  const [goodWithCats, setGoodWithCats] = useState(false);
  const [sterilized, setSterilized] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [underTreatment, setUnderTreatment] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Request camera and image picker permissions
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasCameraPermission(status === "granted");

      const { status: imageStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasImagePickerPermission(imageStatus === "granted");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      resetForm();
    }, [])
  );

  const checkToken = async () => {
    try {
      const response = await axios.get("/auth/check-token");
      if (response.data.isExpired) {
        Alert.alert(
          "Session expirée",
          "Vous avez été déconnecté en raison de l'expiration du session.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking token:", error);
      Alert.alert("Error", "Failed to check token.");
    }
  };

  const resetForm = () => {
    checkToken();
    setName("");
    setSpecies("Chat");
    setBreed("");
    setAge("");
    setPoid("");
    setAdresse("");
    setQrData("");
    setSelectedImage(null);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const splitStr = data.split("pet-info/");
    if (splitStr.length === 0) {
      Alert.alert("Aucune donnée disponible");
    } else {
      const scannedTagCode = splitStr[1];
      const tagCheckResult = await checkTagAvailability(scannedTagCode);
      if (!tagCheckResult) {
        Alert.alert(
          "Tag Code pris",
          "Ce code d'étiquette est déjà associé à un autre animal de compagnie."
        );
        setScanned(false);
        setIsCameraVisible(false);
      } else {
        setQrData(scannedTagCode);
        Alert.alert("Code QR scanné", `Tag Code: ${scannedTagCode}`, [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setIsCameraVisible(false);
            },
          },
          {
            text: "Refuser",
            onPress: () => console.log("Refuser pressé"),
            style: "cancel",
          },
        ]);
      }
    }
  };

  const checkTagAvailability = async (tagCode) => {
    try {
      const response = await axios.get(`/pets/check-tag/${tagCode}`);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return false;
      }
      console.error("Error checking tag availability:", error);
      return false;
    }
  };

  const handleCreatePet = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("species", species);
    formData.append("breed", breed);
    formData.append("age", age);
    formData.append("tagCode", qrData);
    formData.append("poid", poid);
    formData.append("adresse", adresse);
    formData.append("sterilized", sterilized);
    formData.append("hasAllergies", hasAllergies);
    formData.append("underTreatment", underTreatment);
    formData.append("goodWithChildren", goodWithChildren);
    formData.append("goodWithDogs", goodWithDogs);
    formData.append("goodWithCats", goodWithCats);

    if (selectedImage) {
      formData.append("image", {
        uri: selectedImage,
        name: "pet.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const response = await axios.post("/pets/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert(
        "Animal de compagnie créé avec succès !",
        `Pet ID: ${response.data.id}`
      );
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Failed to create pet.");
      console.error(
        "Create pet error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const renderPickerIcon = () => {
    let iconName;
    switch (species) {
      case "Chat":
        iconName = "cat";
        break;
      case "Chien":
        iconName = "dog";
        break;
      case "Cheval":
        iconName = "horse";
        break;
      default:
        iconName = "question";
    }
    return <Icon name={iconName} size={44} color="black" />;
  };

  const pickImage = async () => {
    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Use the URI of the selected image
    }
  };

  if (hasCameraPermission === null || hasImagePickerPermission === null) {
    return <Text>Requesting permissions...</Text>;
  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (hasImagePickerPermission === false) {
    return <Text>No access to image library</Text>;
  }

  return (
    <>
      {isCameraVisible && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={styles.centerText}>
            <Text style={styles.qrText}>Scan the QR code</Text>
          </View>
        </BarCodeScanner>
      )}
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setIsCameraVisible(!isCameraVisible)}
            >
              <Icon
                name={isCameraVisible ? "times" : "camera"}
                size={20}
                color="#fff"
              />
              <Text style={styles.cameraButtonText}>
                {isCameraVisible ? "Annuler" : "Scan QR Code"}
              </Text>
            </TouchableOpacity>

            {!isCameraVisible && !scanned && (
              <View style={styles.inputContainer}>
                <View style={styles.transparentContainer}>
                  <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>
                      {selectedImage ? "Changer Image" : "Choisissez une image"}
                    </Text>
                  </TouchableOpacity>
                  {selectedImage && (
                    <ImageBackground
                      source={{ uri: selectedImage }}
                      style={styles.imagePreview}
                    />
                  )}
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    value={name}
                    onChangeText={setName}
                  />
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={species}
                      style={styles.picker}
                      onValueChange={(itemValue) => setSpecies(itemValue)}
                    >
                      <Picker.Item label="Chat" value="Chat" />
                      <Picker.Item label="Chien" value="Chien" />
                      <Picker.Item label="Cheval" value="Cheval" />
                    </Picker>
                    <View style={styles.iconContainer}>
                      {renderPickerIcon()}
                    </View>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Race"
                    value={breed}
                    onChangeText={setBreed}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Age"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Poid (Weight)"
                    keyboardType="numeric"
                    value={poid}
                    onChangeText={setPoid}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse (Address)"
                    value={adresse}
                    onChangeText={setAdresse}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Code QR Scanné"
                    value={qrData}
                    editable={false}
                  />
                  <View style={styles.row}>
                    <Text>Compatible avec les enfants</Text>
                    <Switch
                      value={goodWithChildren}
                      onValueChange={setGoodWithChildren}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Compatible avec les chiens</Text>
                    <Switch
                      value={goodWithDogs}
                      onValueChange={setGoodWithDogs}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Compatible avec les chats</Text>
                    <Switch
                      value={goodWithCats}
                      onValueChange={setGoodWithCats}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Stérilisé</Text>
                    <Switch value={sterilized} onValueChange={setSterilized} />
                  </View>
                  <View style={styles.row}>
                    <Text>A des allergies</Text>
                    <Switch
                      value={hasAllergies}
                      onValueChange={setHasAllergies}
                    />
                  </View>
                  <View style={styles.row}>
                    <Text>Sous traitement</Text>
                    <Switch
                      value={underTreatment}
                      onValueChange={setUnderTreatment}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleCreatePet}
                  >
                    <Text style={styles.buttonText}>Créer un animal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.5,
  },
  scrollContainer: {
    flex: 1,
    padding: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cameraButtonText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#fff",
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
  },
  transparentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    width: "100%",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  iconContainer: {
    marginLeft: 10,
  },
  compatibilityContainer: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  centerText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  qrText: {
    color: "#fff",
  },
});

export default PetScreen;
