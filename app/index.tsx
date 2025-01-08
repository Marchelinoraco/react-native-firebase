import {
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
} from "react-native";
import React from "react";
import { Linking } from "react-native"; // Import Linking
import { router } from "expo-router";

const index = () => {
  const openURL = (url) => {
    Linking.openURL(url);
  };

  return (
    <ImageBackground
      source={require("../assets/logo.png")} // Ganti dengan URL atau path gambar Anda
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Tata Ruang</Text>

        <Image
          source={require("../assets/logo.png")} // Ganti dengan URL atau path gambar Anda
          style={styles.image}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => openURL("https://arcg.is/1eDSni")}
        >
          <Text style={styles.text}>Link Peta RTRW/RDTR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openURL(
              "https://experience.arcgis.com/experience/fd022572bda94985a77f6e9e1dceb030?views=View-23"
            )
          }
        >
          <Text style={styles.text}>Link Sipetarung</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openURL(
              "https://experience.arcgis.com/experience/c235e278c2194d2499d1172ff1eb47b1/page/FPR/"
            )
          }
        >
          <Text style={styles.text}>Link FPR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openURL(
              "https://sapa-halut.maps.arcgis.com/apps/webappviewer/index.html?id=05f82c0c2b3742d88bf959a0e5e086a2&extent=14126360.9278%2C156317.1039%2C14326167.3197%2C223581.6888%2C102100"
            )
          }
        >
          <Text style={styles.text}>Link Pengendalian</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            openURL(
              "https://experience.arcgis.com/experience/c235e278c2194d2499d1172ff1eb47b1/page/REGULASI%2F-ATURAN/"
            )
          }
        >
          <Text style={styles.text}>Link Aturan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => openURL("https://bhumi.atrbpn.go.id/peta")}
        >
          <Text style={styles.text}>Link Bhumi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonLogin}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.textLogin}>Masuk</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default index;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001A6E", // Tambahkan overlay warna jika diperlukan
  },
  image: {
    width: 100,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 0,
    marginBottom: 30,
    color: "#FFFFFF", // Sesuaikan warna teks agar terlihat di atas gambar
  },
  button: {
    width: "80%",
    marginVertical: 10,
    backgroundColor: "#074799",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLogin: {
    width: "90%",
    marginVertical: 20,
    backgroundColor: "rgba(255, 255, 255,255)",

    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  textLogin: {
    color: "#11111",
    fontSize: 16,
    fontWeight: "600",
  },
});
