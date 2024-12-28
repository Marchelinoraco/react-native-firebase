import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
} from "react-native";
import { db } from "../../FirebaseConfig";
import { auth } from "../../FirebaseConfig";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function TabOneScreen() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);

  const fetchRequests = async (userId) => {
    try {
      const q = query(
        collection(db, "submissions"), // Koleksi data permohonan
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
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

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchRequests(user.uid);
      } else {
        console.log("User not logged in, redirecting to login");
        router.push("/"); // pastikan rute ini benar
      }
    });

    return () => unsubscribe();
  }, []);

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.headerText}>Maksud Permohonan</Text>
      <Text style={styles.headerText}>Tanggal Permohonan</Text>
      <Text style={styles.headerText}>Status</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cellText}>{item.maksudPermohonan}</Text>
      <Text style={styles.cellText}>{item.tanggalPermohonan}</Text>
      <Text style={styles.cellText}>{item.status || "Pending"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.displayName || "User"}!</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A237E",
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#5C6BC0",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
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
  noDataText: {
    textAlign: "center",
    color: "gray",
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#5C6BC0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5C6BC0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
