import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { db } from "../../FirebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase Storage
const storage = getStorage();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "df223cc1-8e11-494e-932f-3d4886621c11",
      })
    ).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }
  return token;
}

export default function FormScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [open, setOpen] = useState(false);
  const [kecamatan, setKecamatan] = useState(null);
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
    luas_lantai_bangunan: "",
    jumlah_lantai_bangunan: "",
    status: "diproses",
    gambar_lokasi: "",
    gambar_npwp: "",
    gambar_ktp: "",
    dokumen_rtb: "",
    dokumen_rpab: "",
    dokumen_permohonan: "",
  });
  const kecamatanOptions = [
    { label: "Kecamatan A", value: "kecamatan_a" },
    { label: "Kecamatan B", value: "kecamatan_b" },
    { label: "Kecamatan C", value: "kecamatan_c" },
    { label: "Kecamatan D", value: "kecamatan_d" },
    // Tambahkan kecamatan lainnya sesuai kebutuhan
  ];

  const [submissions, setSubmissions] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const submissionsCollection = collection(db, "submissions");

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => console.log(err));
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

  const uploadFile = async (uri, filePath) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const pickImage = async (key) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets ? result.assets[0].uri : result.uri;
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
      const downloadURL = await uploadFile(uri, `images/${filename}`);
      handleInputChange(key, downloadURL);
    }
  };

  const pickDocument = async (key) => {
    try {
      let result = await DocumentPicker.getDocumentAsync();
      console.log("Document Picker Result: ", result); // Log hasil untuk debugging

      if (result.assets && result.assets.length > 0) {
        const document = result.assets[0];
        const uri = document.uri;
        const filename =
          document.name || uri.substring(uri.lastIndexOf("/") + 1);

        console.log("Document URI: ", uri);
        console.log("Document Filename: ", filename);

        const downloadURL = await uploadFile(uri, `documents/${filename}`);
        handleInputChange(key, downloadURL);
      } else if (result.canceled) {
        console.log("Document picking was canceled.");
      } else {
        console.error(
          "Unexpected result structure from document picker: ",
          result
        );
      }
    } catch (error) {
      console.error("An error occurred while picking the document: ", error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("No user logged in");
      return;
    }

    if (!expoPushToken) {
      alert("Expo Push Token belum tersedia.");
      return;
    }

    // Validasi kecamatan harus string dan tidak kosong
    if (
      !formData.kecamatan ||
      typeof formData.kecamatan !== "string" ||
      formData.kecamatan.trim() === ""
    ) {
      alert("Kecamatan tidak valid. Silakan pilih kecamatan yang tersedia.");
      return;
    }

    try {
      await addDoc(submissionsCollection, {
        ...formData,
        userId: user.uid,
        keterangan: "",
        expoPushToken,
      });

      alert("Data submitted successfully!");

      // Reset form data after successful submission
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
        luas_lantai_bangunan: "",
        jumlah_lantai_bangunan: "",
        status: "diproses",
        gambar_lokasi: "",
        gambar_npwp: "",
        gambar_ktp: "",
        dokumen_rtb: "",
        dokumen_rpab: "",
        dokumen_permohonan: "",
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Failed to submit data. Please try again.");
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
          { label: "Kecamatan", key: "alamat" },
        ].map((field, index) => (
          <TextInput
            key={index}
            placeholder={field.label}
            value={formData[field.key]}
            onChangeText={(value) => handleInputChange(field.key, value)}
            style={styles.input}
            placeholderTextColor="#808080"
          />
        ))}

        {[
          { label: "Desa Letak Permohonan", key: "desa" },
          { label: "Tanggal Permohonan", key: "tanggalPermohonan" },
          { label: "Luas Lantai Bangunan ", key: "luas_lantai_bangunan" },
          { label: "Jumlah Lantai Bangunan", key: "jumlah_lantai_bangunan" },
        ].map((field, index) => (
          <TextInput
            key={index}
            placeholder={field.label}
            value={formData[field.key]}
            onChangeText={(value) => handleInputChange(field.key, value)}
            style={styles.input}
            placeholderTextColor="#808080"
          />
        ))}

        {[
          { label: "Pilih Gambar Lokasi", key: "gambar_lokasi" },
          { label: "Pilih Gambar NPWP", key: "gambar_npwp" },
          { label: "Pilih Gambar KTP", key: "gambar_ktp" },
          { label: "Pilih Dokumen RTB", key: "dokumen_rtb" },
          { label: "Pilih Dokumen RPAB", key: "dokumen_rpab" },
          { label: "Pilih Dokumen Permohonan", key: "dokumen_permohonan" },
        ].map((field, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              onPress={() =>
                field.key.startsWith("gambar")
                  ? pickImage(field.key)
                  : pickDocument(field.key)
              }
              style={styles.uploadButton}
            >
              <Text style={styles.buttonText}>{field.label}</Text>
            </TouchableOpacity>
            <Text>
              {formData[field.key]
                ? formData[field.key].split("/").pop()
                : "Tidak ada file dipilih"}
            </Text>
          </React.Fragment>
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
    backgroundColor: "#001A6E",
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FAFAFA",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFF",
    color: "#000",
  },
  inputContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#000",
  },

  uploadButton: {
    backgroundColor: "#5C6BC0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#5C6BC0",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#FAFAFA",
  },
});
