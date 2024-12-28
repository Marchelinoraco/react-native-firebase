import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  SafeAreaView,
  View,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { db } from "../../FirebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export default function FormScreen() {
  const [formData, setFormData] = useState({
    namaPemohon: "",
    maksudPermohonan: "",
    nik: "",
    pekerjaan: "",
    npwp: "",
    noTlp: "",
    alamat: "",
    kecamatan: "",
    desa: "",
    tanggalPermohonan: "",
    status: "diproses", // Add the status field with default value
  });
  const [submissions, setSubmissions] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const submissionsCollection = collection(db, "submissions");

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (user) {
      const data = await getDocs(submissionsCollection);
      setSubmissions(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } else {
      console.log("No user logged in");
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (user) {
      await addDoc(submissionsCollection, { ...formData, userId: user.uid });
      setFormData({
        namaPemohon: "",
        maksudPermohonan: "",
        nik: "",
        pekerjaan: "",
        npwp: "",
        noTlp: "",
        alamat: "",
        kecamatan: "",
        desa: "",
        tanggalPermohonan: "",
        status: "diproses", // Reset status to default after submission
      });
      fetchSubmissions();
    } else {
      console.log("No user logged in");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainTitle}>Form Permohonan</Text>
        {[
          { label: "Nama Pemohon", key: "namaPemohon" },
          { label: "Maksud Permohonan", key: "maksudPermohonan" },
          { label: "NIK", key: "nik" },
          { label: "Pekerjaan", key: "pekerjaan" },
          { label: "NPWP", key: "npwp" },
          { label: "No. Tlp", key: "noTlp" },
          { label: "Alamat", key: "alamat" },
          { label: "Kecamatan", key: "kecamatan" },
          { label: "Desa Letak Permohonan", key: "desa" },
          { label: "Tanggal Permohonan", key: "tanggalPermohonan" },
        ].map((field, index) => (
          <TextInput
            key={index}
            placeholder={field.label}
            value={formData[field.key]}
            onChangeText={(value) => handleInputChange(field.key, value)}
            style={styles.input}
          />
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },
  submitButton: {
    backgroundColor: "#5C6BC0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submissionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  table: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#5C6BC0",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerText: {
    flex: 1,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  cellText: {
    flex: 1,
    textAlign: "center",
    color: "#333333",
  },
});
