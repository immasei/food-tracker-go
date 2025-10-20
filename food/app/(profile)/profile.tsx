import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Pressable} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import firebaseApp from "../../config/firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

// Initialize Firebase Database
const db = getFirestore(firebaseApp);

// Data type definition for user data
type UserData = {
  id: string;
  username: string;
  email: string;
  phone_no: string;
};

// Mock statistics data
const statsData = {
  totalItems: 12,
  sharingItems: 5,
  expiringItems: 3,
  expiredItems: 1,
  categories: 4
};

// User React Component
const User = () => {
  const router = useRouter();  // Expo router for navigation
  const { user, logout, authChecked } = useContext(AuthContext);   // Use AuthContext to get user info and logout method
  const [userData, setUserData] = useState<UserData | null>(null); // Variable to store user data

  // Auto start:
  useEffect(() => {
    // Check if user is logged in
    if (!authChecked) return; // If auth state is not checked, skip the code.
    if (!user?.uid) {     // If no user is logged in
      setUserData(null);  // Reset user data variable
      return;
    }

    // Fetch user data from Firebase
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as Partial<UserData>;
          setUserData({
            id: snap.id,
            username: data.username ?? "",
            email: data.email ?? "",
            phone_no: data.phone_no ?? ""
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    })();
  }, [authChecked, user?.uid]); // Re-run when authCheck state or user ID changes

  // Method to return one card in user statistics area
  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color="#39f" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  // Method to handle user logout
  const handleLogout = async () => {
    await logout();  // Call logout method from AuthContext
    router.replace("/login");
  };



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
          <Text style={styles.statsTitle}>Food Tracking Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total Food"    value={statsData.totalItems}    icon="fast-food-outline" />
            <StatCard title="Sharing Food"  value={statsData.sharingItems}  icon="people-outline" />
            <StatCard title="Expiring Food" value={statsData.expiringItems} icon="timer-outline" />
            <StatCard title="Expired Food"  value={statsData.expiredItems}  icon="warning-outline" />
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

        {/* Log out button */}
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default User;

// Style sheet
const styles = StyleSheet.create({
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
  logoutButton: {
    backgroundColor: "#e55",
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
