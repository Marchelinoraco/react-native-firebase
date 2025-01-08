import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { auth } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../FirebaseConfig";
import { router } from "expo-router";
import { getDoc, doc } from "firebase/firestore";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get the user's data from Firestore to check the role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // Navigate based on the user's role
        if (userRole === "admin") {
          router.replace("/admin"); // Navigate to the admin page
        } else {
          router.replace("/(tabs)"); // Navigate to the regular user page
        }
      }
    } catch (error) {
      console.log("Sign in failed:", error);
      alert("Sign in failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Image source={require("../assets/logo.png")} style={styles.image} />
      <TextInput
        style={styles.textInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#808080"
      />
      <TextInput
        style={styles.textInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#808080"
      />
      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.text}>Masuk</Text>
      </TouchableOpacity>
      <View>
        {" "}
        <Text style={styles.textLogin}>Belum punya akun?</Text>
      </View>
      <TouchableOpacity
        style={styles.buttonRegis}
        onPress={() => router.push("/signUp")}
      >
        <Text style={styles.textAkun}>Daftar Akun</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#074799", // Background color
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 40,
    color: "#FAFAFA", // Title text color
  },
  textInput: {
    height: 50,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderColor: "#131010",
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 15,
    paddingHorizontal: 25,
    fontSize: 16,
    color: "#131010",
    shadowColor: "#9E9E9E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    width: "90%",
    marginVertical: 15,
    backgroundColor: "#001A6E",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonRegis: {
    marginVertical: 15,
    backgroundColor: "#0069D9", // Add background color for registration button
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: "#FAFAFA", // Button text color
    fontSize: 16,
    fontWeight: "600",
  },
  textLogin: {
    color: "#FAFAFA",
    fontSize: 14,
    fontWeight: "600",
  },
  textAkun: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: 100,
    height: 150,
    marginBottom: 20,
  },
});
