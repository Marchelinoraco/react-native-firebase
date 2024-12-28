import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { db } from "../FirebaseConfig";
import { auth } from "../FirebaseConfig";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
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
  const [expoPushToken, setExpoPushToken] = useState("");
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((err) => console.log(err));
  }, []);

  const sendNotification = async () => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "NEWG",
      body: `berhasil 200 OK`,
    };
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchRequests(); // Ambil semua data dari Firestore
      } else {
        router.replace("/"); // Jika tidak ada pengguna, kembali ke halaman login
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "submissions"));
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData); // Set data permohonan ke state
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
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
      const requestDoc = doc(db, "submissions", id); // Ambil referensi dokumen berdasarkan ID
      await updateDoc(requestDoc, {
        status: newStatus, // Perbarui nilai status
      });
      fetchRequests(); // Ambil kembali data permohonan setelah update
      sendNotification();
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

  const handleDetailPress = (item) => {
    setSelectedRequest(item); // Set data request yang dipilih
    setModalVisible(true); // Buka modal
  };

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

      {/* Modal untuk Menampilkan Detail */}
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
                <Text>
                  <Text style={styles.boldText}>NIK:</Text>{" "}
                  {selectedRequest.nik}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Pekerjaan:</Text>{" "}
                  {selectedRequest.pekerjaan}
                </Text>
                <Text>
                  <Text style={styles.boldText}>NPWP:</Text>{" "}
                  {selectedRequest.npwp}
                </Text>
                <Text>
                  <Text style={styles.boldText}>No Tlp:</Text>{" "}
                  {selectedRequest.noTlp}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Alamat:</Text>{" "}
                  {selectedRequest.alamat}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Kecamatan:</Text>{" "}
                  {selectedRequest.kecamatan}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Desa:</Text>{" "}
                  {selectedRequest.desa}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Tanggal Permohonan:</Text>{" "}
                  {selectedRequest.tanggalPermohonan}
                </Text>
                <Text>
                  <Text style={styles.boldText}>Status Permohonan:</Text>{" "}
                  {selectedRequest.status}
                </Text>

                {/* Tombol untuk mengubah status */}
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
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E88E5",
    marginBottom: 20,
    marginVertical: 20,
    textAlign: "center",
  },
  table: {
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  headerText: {
    flex: 1,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginBottom: 5,
    elevation: 1,
  },
  cellText: {
    flex: 1,
    textAlign: "center",
    color: "#333333",
    fontSize: 14,
  },
  detailText: {
    color: "#1E88E5",
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 10,
  },
  noDataText: {
    textAlign: "center",
    color: "gray",
    marginTop: 10,
    fontSize: 16,
    fontStyle: "italic",
  },
  button: {
    width: "100%",
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#1E88E5",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  statusButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  tolakButton: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  terbitButton: {
    backgroundColor: "#87CEEB",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  boldText: {
    fontWeight: "700",
  },
});
