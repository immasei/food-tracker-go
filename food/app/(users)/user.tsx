import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Pressable} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

// Initialize Firebase Database
const db = getFirestore(firebaseApp);

// Data type for user data
type UserData = {
  id: string;
  username: string;
  email: string;
  phone_no: string;
};

// Mock statistics data
const statsData = {
  totalItems: 12,
  expiringItems: 3,
  expiredItems: 1,
  categories: 4
};

// User React Component
const User = () => {
  const router = useRouter();
  const context = useContext(AuthContext);
  const [userData, setUserData] = useState<UserData | null>(null); // Variable to store user data

  async function logout() {
    await context.logout();
    router.replace("/login");
  }
  // Fetch user data from Firebase
  async function fetchUser() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Temporary only get the first user
        setUserData({
          id: doc.id,
          username: doc.data().username,
          email: doc.data().email,
          phone_no: doc.data().phone_no
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  // Auto start
  useEffect(() => {
    fetchUser();
  }, []);

  // Method to return a user status card
  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#2196F3" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User information area */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: '' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.username}>{userData?.username || "Loading..."}</Text>
          <Text style={styles.userDetail}>Email: {userData?.email || ""}</Text>
          <Text style={styles.userDetail}>Mobile: {userData?.phone_no || ""}</Text>
          {/* Top settings button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/(settings)/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Statistics information area */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Food tracking statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total food" value={statsData.totalItems} icon="fast-food-outline" />
            <StatCard title="Expiring" value={statsData.expiringItems} icon="timer-outline" />
            <StatCard title="Expired" value={statsData.expiredItems} icon="warning-outline" />
            <StatCard title="Food categories" value={statsData.categories} icon="apps-outline" />
          </View>
        </View>

        {/* Option list area (Currently only Settings) */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingsButtom}
            onPress={() => router.push("/(settings)/settings")}
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Add bottom padding for scrolling */}
        <View style={styles.bottomPadding} />

        <Pressable onPress={logout} style={styles.btnDanger}>
          <Text style={styles.btnText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default User;

// Style sheet
const styles = StyleSheet.create({
  btnDanger: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 30,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  userDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  statsContainer: {
    padding: 20,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    paddingLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07f',
    marginVertical: 5,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    marginTop: 0,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  settingsButtom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  settingsText: {
    fontSize: 18,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 5,
    color: '#666',
    fontSize: 14,
  },
});