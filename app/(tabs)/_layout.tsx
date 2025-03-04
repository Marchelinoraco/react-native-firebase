import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { Pressable, Alert, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { auth } from "@/FirebaseConfig";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Fungsi Sign Out
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      Alert.alert("Sign Out", "You have been signed out successfully.");
      router.push("../"); // Kembali ke halaman login setelah sign out
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null); // Pastikan state user benar-benar di-reset
        router.push("/"); // Jika tidak ada user, alihkan ke halaman login
      }
    });

    return () => unsubscribe(); // Bersihkan listener saat komponen tidak lagi digunakan
  }, [router]);

  if (!user) {
    // Jika pengguna belum login, tampilkan loading atau halaman kosong
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <FontAwesome
                name="sign-out"
                size={25}
                color={Colors.text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
      {/* Tambahkan tab lainnya */}
      <Tabs.Screen
        name="two"
        options={{
          title: "Form",
          tabBarIcon: ({ color }) => <TabBarIcon name="file" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <FontAwesome
                name="sign-out"
                size={25}
                color={Colors.text}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.background,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 12,
  },
});
