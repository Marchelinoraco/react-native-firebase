import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

export default function Detail() {
  const router = useRouter();
  const { id } = router.query; // Dapatkan parameter `id` dari URL
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDetail(id); // Ambil data berdasarkan ID
    }
  }, [id]);

  const fetchDetail = async (docId) => {
    try {
      const docRef = doc(db, "submissions", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDetail(docSnap.data()); // Set data dokumen ke state
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail Permohonan</Text>
      {detail ? (
        <View>
          {Object.entries(detail).map(([key, value]) => (
            <Text style={styles.detailText} key={key}>
              {key}: {value}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.loadingText}>Memuat data...</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Tambahkan styling sesuai kebutuhan
});
