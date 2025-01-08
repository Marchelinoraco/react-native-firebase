import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Modal,
  TextInput,
  Platform,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { db } from "../FirebaseConfig"; // Pastikan mengimpor konfigurasi Firebase Anda
import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../FirebaseConfig";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

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

export default function Admin() {
  const [expoToken, setExpoToken] = useState("");
  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => console.log(err));
  }, []);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); // Tambahkan state userId
  const [requests, setRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [keterangan, setKeterangan] = useState("");

  const fetchExpoPushTokenFromFirestore = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "submissions"));
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);

      if (requestsData.length > 0) {
        const token = requestsData[0].expoPushToken;
        setExpoPushToken(token);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchExpoPushTokenFromFirestore();
  }, []);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchRequests();
      } else {
        router.replace("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const sendNotification = async (status) => {
    if (!expoPushToken) {
      console.error("No expoPushToken available!");
      return;
    }

    let messageBody = "";
    switch (status) {
      case "Diterbitkan":
        messageBody = "Permohonan Anda telah diterbitkan.";
        break;
      case "Diterima":
        messageBody = "Permohonan Anda telah diterima.";
        break;
      case "Ditolak":
        messageBody = "Permohonan Anda telah ditolak.";
        break;
      default:
        messageBody = "Ada pembaruan pada permohonan Anda.";
    }

    const message = {
      to: expoPushToken,
      sound: "default",
      title: "NEWG",
      body: messageBody,
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      console.log("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleUpdateKeterangan = async (id, keterangan) => {
    if (!id || !keterangan) {
      console.error("ID or keterangan is missing!");
      return;
    }

    try {
      const requestDoc = doc(db, "submissions", id);
      await updateDoc(requestDoc, { keterangan });
      setModalVisible(false);
      setKeterangan("");
      fetchRequests();
    } catch (error) {
      console.error("Error updating keterangan:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "submissions"));
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleDetailPress = (item) => {
    console.log("Selected Request:", item);
    setSelectedRequest(item);
    setModalVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const requestDoc = doc(db, "submissions", id);
      await updateDoc(requestDoc, {
        status: newStatus,
      });
      fetchRequests();
      sendNotification(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Maksud Permohonan</Text>
      <Text style={styles.headerText}>Tanggal</Text>
      <Text style={styles.headerText}>Status</Text>
      <Text style={styles.headerText}>Aksi</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cellText}>{item.maksudPermohonan}</Text>
      <Text style={styles.cellText}>{item.tanggalPermohonan}</Text>
      <Text style={styles.cellText}>{item.status}</Text>
      <TouchableOpacity onPress={() => handleDetailPress(item)}>
        <Text style={styles.detailText}>Detail</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.displayName || "Admin"}!</Text>
      {requests.length === 0 ? (
        <Text style={styles.noDataText}>Tidak ada data permohonan</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          style={styles.table}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>

      {/* Modal for displaying details */}
      {selectedRequest && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Detail Permohonan</Text>
                <Text>
                  <Text style={styles.boldText}>Nama Pemohon:</Text>{" "}
                  {selectedRequest.namaPemohon}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Maksud Permohonan:</Text>{" "}
                  {selectedRequest.maksudPermohonan}
                </Text>
                {/* Gambar */}
                {selectedRequest.imageUrl && (
                  <Image
                    source={{ uri: selectedRequest.imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                )}
                {/* Dokumen */}
                {selectedRequest.dokumen_rtb && (
                  <TouchableOpacity
                    style={styles.documentButton}
                    onPress={() => Linking.openURL(selectedRequest.dokumen_rtb)}
                  >
                    <Text style={styles.text}>Buka Dokumen</Text>
                  </TouchableOpacity>
                )}
                {/* Keterangan */}
                <TextInput
                  style={styles.inputField}
                  placeholder="Masukkan Keterangan"
                  value={keterangan}
                  onChangeText={setKeterangan}
                />
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() =>
                    handleUpdateKeterangan(selectedRequest?.id, keterangan)
                  }
                >
                  <Text style={styles.text}>Simpan Keterangan</Text>
                </TouchableOpacity>

                {/* Status */}
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() =>
                    handleStatusChange(selectedRequest.id, "Diterbitkan")
                  }
                >
                  <Text style={styles.text}>Terbitkan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() =>
                    handleStatusChange(selectedRequest.id, "Diterima")
                  }
                >
                  <Text style={styles.text}>Terima</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tolakButton}
                  onPress={() =>
                    handleStatusChange(selectedRequest.id, "Ditolak")
                  }
                >
                  <Text style={styles.text}>Tolak</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.text}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#001A6E",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
    color: "#FAFAFA",
  },
  noDataText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
  },
  table: {
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cellText: {
    fontSize: 14,
    flex: 1,
    textAlign: "left",
  },
  detailText: {
    fontSize: 14,
    color: "#007BFF",
  },
  button: {
    backgroundColor: "#FF5C5C",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
  },
  documentButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  statusButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  tolakButton: {
    backgroundColor: "#FF5C5C",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
});
